import { Transaction } from '@dotfile-tms/database';
import { Injectable } from '@nestjs/common';
import { AccountHistoryRedisService } from '../data/accounthistory.service';
import { AlertAggregateService } from '../data/alert-aggregate.service';
import { RiskAccountsService } from '../data/risk-accounts.service';
import { RuleEvalResult } from '../data/rule-eval-result.entity';
import { evalRules } from '../domain/rules-evaluator';

@Injectable()
export class RuleEvaluatorService {
  constructor(
    // private rulesAggregate: RulesAggregate, // Later: use this to query the rules
    private alertAggregateService: AlertAggregateService,
    private accountHistoryService: AccountHistoryRedisService,
    private riskAccountsService: RiskAccountsService
  ) {}

  async inspect(transaction: Transaction): Promise<RuleEvalResult[]> {
    // Later: query the ruleAggregate for the rules to be used
    // Later: "interpret" the rules payload, as json AST, etc.
    // Later: This is a root rule evaluator, later use a BullMQ flow to split & scale complex rules.
    const results: RuleEvalResult[] = await evalRules(
      transaction,
      this.accountHistoryService,
      this.riskAccountsService
    );

    // Later: extract this to a alert dispatch service
    for (const result of results) {
      if (result.isSuspicious) {
        await this.alertAggregateService.createAlertForTransaction(
          transaction.id,
          result.ruleId,
          result.reason
        );
      }
    }

    return results;
  }
}
