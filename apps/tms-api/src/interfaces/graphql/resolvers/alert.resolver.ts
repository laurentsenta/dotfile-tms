import { Alert, Rule, Transaction } from '@dotfile-tms/database';
import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AppService } from '../../../app/app.service';
import { RuleEvaluatorService } from '../../../app/services/rule-evaluator.service';
import { AlertType } from '../types/alert.type';
import { RuleType } from '../types/rule.type';
import { TransactionType } from '../types/transaction.type';

@Resolver(() => AlertType)
export class AlertResolver {
  constructor(
    private readonly appService: AppService,
    private readonly ruleEvaluatorService: RuleEvaluatorService
  ) {}

  @Query(() => [AlertType])
  async alerts(): Promise<Alert[]> {
    return this.appService.listAllAlerts();
  }

  @Query(() => [AlertType])
  async alertsByTransaction(
    @Args('transactionId', { type: () => ID }) transactionId: string
  ): Promise<Alert[]> {
    return this.appService.getAlertsByTransactionId(transactionId);
  }

  @ResolveField('rule', () => RuleType)
  async getRule(@Parent() alert: Alert): Promise<Rule> {
    return this.ruleEvaluatorService.getRuleByName(alert.rule.name);
  }

  @ResolveField('transaction', () => TransactionType)
  async getTransaction(@Parent() alert: Alert): Promise<Transaction | null> {
    try {
      const transactions = await this.appService.listAllTransactions();
      return transactions.find((tx) => tx.id === alert.transaction.id) || null;
    } catch {
      return null;
    }
  }
}
