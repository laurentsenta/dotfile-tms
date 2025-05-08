import {
  Alert,
  AlertStatusEnum,
  Rule,
  Transaction,
} from '@dotfile-tms/database';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionQueueService } from '../rules/transaction-queue.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { RuleEvaluatorService } from './services/rule-evaluator.service';

const UNIQUE_CONSTRAINT_VIOLATION_CODE = '23505';
// Default rule ID is no longer needed as we get the rule name from the evaluation result

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private ruleEvaluatorService: RuleEvaluatorService,
    private txQueueService: TransactionQueueService
  ) {}

  async listAllTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.find();
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    // Map DTO to entity
    const transaction = new Transaction();
    transaction.externalId = createTransactionDto.external_id;
    transaction.date = new Date(createTransactionDto.date);
    transaction.sourceAccountKey = createTransactionDto.source_account_key;
    transaction.targetAccountKey = createTransactionDto.target_account_key;
    transaction.amount = createTransactionDto.amount;
    transaction.currency = createTransactionDto.currency;
    transaction.type = createTransactionDto.type;
    transaction.metadata = createTransactionDto.metadata;

    transaction.processedAt = new Date();

    try {
      const savedTransaction = await this.transactionRepository.save(
        transaction
      );

      // TODO: we have an issue here, we might miss transaction if the process dies between the save and notify.
      this.txQueueService.notifyTransactionCreated({ id: savedTransaction.id });

      const evalResults = await this.ruleEvaluatorService.inspect(savedTransaction);

      // Process each rule evaluation result
      for (const result of evalResults) {
        // If suspicious, create an alert
        if (result.isSuspicious) {
          await this.createAlertForTransaction(
            savedTransaction.id,
            result.ruleName,
            result.reason
          );
        }
      }

      return savedTransaction;
    } catch (error) {
      if (
        error.code === UNIQUE_CONSTRAINT_VIOLATION_CODE &&
        error.detail?.includes('external_id')
      ) {
        throw new ConflictException(
          `Transaction with external_id '${createTransactionDto.external_id}' already exists`
        );
      }
      if (error.code === UNIQUE_CONSTRAINT_VIOLATION_CODE) {
        throw new ConflictException(
          `Transaction with the same unique constraint already exists`
        );
      }

      throw error;
    }
  }

  async listAllAlerts(): Promise<Alert[]> {
    return this.alertRepository.find({ relations: ['rule'] });
  }

  async getAlertsByTransactionId(transactionId: string): Promise<Alert[]> {
    return this.alertRepository.find({
      where: {
        transaction: { id: transactionId },
      },
      relations: ['rule', 'transaction'],
    });
  }

  private async createAlertForTransaction(
    transactionId: string,
    ruleName?: string,
    reason?: string
  ): Promise<Alert> {
    if (!ruleName) {
      throw new Error('Rule name is required to create an alert');
    }
    
    // Get the rule by name
    const rule = await this.ruleRepository.findOne({
      where: { name: ruleName },
    });

    if (!rule) {
      throw new NotFoundException(
        `Rule '${ruleName}' not found`
      );
    }

    // Get the transaction
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`
      );
    }

    // Create an alert
    const alert = new Alert();
    alert.rule = rule;
    alert.transaction = transaction;
    alert.status = AlertStatusEnum.NEW;

    if (reason) {
      alert.metadata = { reason };
    }

    return this.alertRepository.save(alert);
  }
}
