import { differenceInDays } from 'date-fns';
import { RuleBase } from './rule-base';

const CONFIG = {
  DORMANCY_THRESHOLD_DAYS: 90,
  SUSPICIOUS_DAILY_TX_THRESHOLD: 5,
  DORMANT_FLAG_TTL: 60 * 60 * 24,
};

function daysBetween(date1: Date, date2: Date): number {
  return differenceInDays(date1, date2);
}

/**
 * Checks if a transaction is from a dormant account with high activity
 * A transaction is considered suspicious if:
 * 1. The account was dormant (no activity for DORMANCY_THRESHOLD_DAYS)
 * 2. The account has more than SUSPICIOUS_DAILY_TX_THRESHOLD transactions in a day
 */
export const dormantAccountActivity: RuleBase = {
  id: 'dormant_account_activity',
  
  evaluate: async ({ transaction, history }) => {
    // Flag the activity and get the previous activity date
    const previousActivityDate = await history.flagActivity(
      transaction.sourceAccountKey,
      transaction.date
    );

    // Calculate days since last activity if there was previous activity
    let daysSinceLastActivity = 0;
    if (previousActivityDate) {
      daysSinceLastActivity = daysBetween(
        transaction.date,
        previousActivityDate
      );
    }

    // Check if the account was dormant (no activity for DORMANCY_THRESHOLD_DAYS)
    let isDormant: boolean =
      daysSinceLastActivity >= CONFIG.DORMANCY_THRESHOLD_DAYS;

    if (isDormant) {
      // Set the dormant flag with a TTL
      await history.setWasDormant(
        transaction.sourceAccountKey,
        CONFIG.DORMANT_FLAG_TTL
      );
    } else {
      // If not dormant, check if it was previously flagged as dormant
      isDormant = await history.getWasDormant(transaction.sourceAccountKey);
    }

    if (isDormant) {
      const dailyTxTotal = await history.getDailyTxTotal(
        transaction.sourceAccountKey,
        transaction.date
      );

      if (dailyTxTotal >= CONFIG.SUSPICIOUS_DAILY_TX_THRESHOLD) {
        return {
          isSuspicious: true,
          reason: `Dormant account with high activity: ${dailyTxTotal} transactions in a day after ${daysSinceLastActivity} days of inactivity`,
        };
      }
    }

    return {
      isSuspicious: false,
    };
  },
};
