import { RuleBase } from './rule-base';

/**
 * Checks if a transaction involves a high-risk merchant
 * A transaction is considered suspicious if the target account is in the high-risk merchants list
 */
export const highRiskMerchants: RuleBase = {
  id: 'high_risk_merchants',

  evaluate: async ({ transaction, riskAccounts }) => {
    let highRiskAccount: string | undefined;

    if (riskAccounts.match(transaction.targetAccountKey)) {
      highRiskAccount = transaction.targetAccountKey;
    } else if (riskAccounts.match(transaction.sourceAccountKey)) {
      highRiskAccount = transaction.sourceAccountKey;
    }

    if (highRiskAccount) {
      return {
        isSuspicious: true,
        reason: `Transaction involves high-risk merchant account (${highRiskAccount})`,
      };
    }

    return {
      isSuspicious: false,
    };
  },
};
