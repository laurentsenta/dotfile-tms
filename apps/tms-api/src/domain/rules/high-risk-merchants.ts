import { Transaction } from '@dotfile-tms/database';
import { RiskAccounts } from '../../data/risk-accounts.entity';
import { RuleEvalResult } from '../../data/rule-eval-result.entity';

/**
 * Rule ID for high-risk merchant transactions
 * Exported as a constant for reuse in other parts of the application
 */
export const HIGH_RISK_MERCHANTS_RULE_ID = 'high_risk_merchants';

/**
 * Checks if a transaction involves a high-risk merchant
 * A transaction is considered suspicious if the target account is in the high-risk merchants list
 *
 * @param transaction The transaction to check
 * @param riskAccounts The risk accounts service to check if an account is high-risk
 * @returns A RuleEvalResult indicating if the transaction is suspicious and a reason if it is
 */
export async function highRiskMerchants(
  transaction: Transaction,
  riskAccounts: RiskAccounts
): Promise<RuleEvalResult> {
  let highRiskAccount: string | undefined;

  if (riskAccounts.match(transaction.targetAccountKey)) {
    highRiskAccount = transaction.targetAccountKey;
  } else if (riskAccounts.match(transaction.sourceAccountKey)) {
    highRiskAccount = transaction.sourceAccountKey;
  }

  if (highRiskAccount) {
    return {
      ruleName: HIGH_RISK_MERCHANTS_RULE_ID,
      isSuspicious: true,
      reason: `Transaction involves high-risk merchant account (${highRiskAccount})`,
    };
  }

  return {
    ruleName: HIGH_RISK_MERCHANTS_RULE_ID,
    isSuspicious: false,
  };
}
