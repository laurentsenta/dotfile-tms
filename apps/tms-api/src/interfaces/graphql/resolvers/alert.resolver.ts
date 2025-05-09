import { Alert, Rule, Transaction } from '@dotfile-tms/database';
import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AlertAggregateService } from '../../../data/alert-aggregate.service';
import { RulesAggregateService } from '../../../data/rules-aggregate.service';
import { TransactionAggregateService } from '../../../data/transaction-aggregate.service';
import { AlertType } from '../types/alert.type';
import { RuleType } from '../types/rule.type';
import { TransactionType } from '../types/transaction.type';

@Resolver(() => AlertType)
export class AlertResolver {
  constructor(
    private readonly alertService: AlertAggregateService,
    private readonly transactions: TransactionAggregateService,
    private readonly ruleEvaluatorService: RulesAggregateService
  ) {}

  @Query(() => [AlertType])
  async alerts(): Promise<Alert[]> {
    return this.alertService.listAllAlerts();
  }

  @Query(() => [AlertType])
  async alertsByTransaction(
    @Args('transactionId', { type: () => ID }) transactionId: string
  ): Promise<Alert[]> {
    return this.alertService.getAlertsByTransactionId(transactionId);
  }

  @ResolveField('rule', () => RuleType)
  async getRule(@Parent() alert: Alert): Promise<Rule> {
    return this.ruleEvaluatorService.getRuleByName(alert.rule.name);
  }

  @ResolveField('transaction', () => TransactionType)
  async getTransaction(@Parent() alert: Alert): Promise<Transaction | null> {
    try {
      const transactions = await this.transactions.listAllTransactions();
      return transactions.find((tx) => tx.id === alert.transaction.id) || null;
    } catch {
      return null;
    }
  }
}
