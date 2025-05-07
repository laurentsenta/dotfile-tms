import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, Rule, Alert, AlertStatusEnum } from '@dotfile-tms/database';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { RuleEvaluatorService } from './services/rule-evaluator.service';

const UNIQUE_CONSTRAINT_VIOLATION_CODE = '23505';
const DEFAULT_RULE_ID = 'suspicious_activity';

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
  ) {}

  async listAllTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.find();
  }

  async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
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
      const savedTransaction = await this.transactionRepository.save(transaction);
      
      const evalResult = this.ruleEvaluatorService.inspect(savedTransaction);
      
      // If suspicious, create an alert
      if (evalResult.isSuspicious) {
        await this.createAlertForTransaction(
          savedTransaction.id, 
          evalResult.reason
        );
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
        transaction: { id: transactionId } 
      },
      relations: ['rule', 'transaction']
    });
  }

  private async createAlertForTransaction(
    transactionId: string, 
    reason?: string
  ): Promise<Alert> {
    // Get the default rule
    const rule = await this.ruleRepository.findOne({ 
      where: { name: DEFAULT_RULE_ID } 
    });
    
    if (!rule) {
      throw new NotFoundException(`Default rule '${DEFAULT_RULE_ID}' not found`);
    }
    
    // Get the transaction
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId }
    });
    
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
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
