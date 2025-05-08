import { Transaction } from '@dotfile-tms/database';
import { AccountHistory } from '../data/accounthistory.entity';
import { RiskAccounts } from '../data/risk-accounts.entity';
import { RuleEvalResult } from '../data/rule-eval-result.entity';
import { dormantAccountActivity } from './rules/dormant-account-activity';
import { highRiskMerchants } from './rules/high-risk-merchants';
import { highVelocityTransactions } from './rules/high-velocity-transactions';
import { RuleBase } from './rules/rule-base';
import { suspiciousActivity } from './rules/suspicious-activity';

export const DEFAULT_RULES: RuleBase[] = [
  suspiciousActivity,
  highVelocityTransactions,
  highRiskMerchants,
  dormantAccountActivity,
];

export const evalRules = async (
  transaction: Transaction,
  history: AccountHistory,
  riskAccounts: RiskAccounts
): Promise<RuleEvalResult[]> => {
  const results: RuleEvalResult[] = await Promise.all(
    DEFAULT_RULES.map(async (rule) => {
      try {
        return {
          ruleId: rule.id,
          ...(await rule.evaluate({
            transaction,
            history,
            riskAccounts,
          })),
        };
      } catch (error) {
        return {
          ruleId: rule.id,
          isSuspicious: true,
          reason: `Error evaluating rule: ${rule.id} - ${error.message}`,
        };
      }
    })
  );

  return results;
};
