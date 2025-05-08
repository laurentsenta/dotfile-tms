import { RuleBase } from './rule-base';

const THRESHOLD_FOR_SUSPICIOUS_ACTIVITY_DETECTION = 10000;

function formatDateToDay(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Checks if a transaction is suspicious based on predefined criteria.
 * A transaction is considered suspicious if:
 * 1. Its individual amount exceeds the threshold (10000)
 * 2. The total amount for the account on that day (including this transaction) exceeds the threshold
 */
export const suspiciousActivity: RuleBase = {
  id: 'suspicious_activity',
  
  evaluate: async ({ transaction, history }) => {
    const account = transaction.sourceAccountKey;
    const day = formatDateToDay(transaction.date);

    const newDailyTotal = await history.incDailyTx(
      account,
      day,
      transaction.amount
    );

    if (newDailyTotal > THRESHOLD_FOR_SUSPICIOUS_ACTIVITY_DETECTION) {
      return {
        isSuspicious: true,
        reason: `Daily total (${newDailyTotal}) for account ${account} on ${day} exceeds threshold of ${THRESHOLD_FOR_SUSPICIOUS_ACTIVITY_DETECTION}`,
      };
    }

    return {
      isSuspicious: false,
    };
  },
};
