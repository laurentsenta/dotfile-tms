import {
  Alert,
  AlertStatusEnum,
  Rule,
  Transaction,
} from '@dotfile-tms/database';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AlertAggregate {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>
  ) {}

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

  public async createAlertForTransaction(
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
      throw new NotFoundException(`Rule '${ruleName}' not found`);
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
