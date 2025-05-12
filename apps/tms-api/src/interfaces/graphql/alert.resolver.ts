import { Alert, Rule, Transaction } from '@dotfile-tms/database';
import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AlertAggregate } from '../../data/alert.aggregate';
import { RulesAggregate } from '../../data/rules.aggregate';
import { TransactionAggregate } from '../../data/transaction.aggregate';
import { AlertType } from '../dto/alert.type';
import { RuleType } from '../dto/rule.type';
import { TransactionType } from '../dto/transaction.type';

@Resolver(() => AlertType)
export class AlertResolver {
  constructor(
    private readonly alertService: AlertAggregate,
    private readonly transactions: TransactionAggregate,
    private readonly ruleEvaluatorService: RulesAggregate
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
