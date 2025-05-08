import { Transaction } from '@dotfile-tms/database';
import { AccountHistory } from '../../data/accounthistory.entity';
import { RuleEvalResult } from '../../data/rule-eval-result.entity';

export const DORMANT_ACCOUNT_ACTIVITY_RULE_ID = 'dormant_account_activity';

const CONFIG = {
  DORMANCY_THRESHOLD_DAYS: 90,
  SUSPICIOUS_DAILY_TX_THRESHOLD: 5,
  DORMANT_FLAG_TTL: 60 * 60 * 24,
};

/**
 * Calculates the number of days between two dates
 * @param date1 The first date
 * @param date2 The second date
 * @returns The number of days between the two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffMs = Math.abs(date1.getTime() - date2.getTime());
  return Math.round(diffMs / oneDay);
}

/**
 * Checks if a transaction is from a dormant account with high activity
 * A transaction is considered suspicious if:
 * 1. The account was dormant (no activity for DORMANCY_THRESHOLD_DAYS)
 * 2. The account has more than SUSPICIOUS_DAILY_TX_THRESHOLD transactions in a day
 */
export async function dormantAccountActivity(
  transaction: Transaction,
  history: AccountHistory
): Promise<RuleEvalResult> {
  const transactionDate = new Date(transaction.date);
  const day = transactionDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // Flag the activity and get the previous activity date
  const previousActivityDate = await history.flagActivity(
    transaction.sourceAccountKey,
    transactionDate
  );

  // Calculate days since last activity if there was previous activity
  let daysSinceLastActivity = 0;
  if (previousActivityDate) {
    daysSinceLastActivity = daysBetween(transactionDate, previousActivityDate);
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
      day
    );

    if (dailyTxTotal >= CONFIG.SUSPICIOUS_DAILY_TX_THRESHOLD) {
      return {
        ruleName: DORMANT_ACCOUNT_ACTIVITY_RULE_ID,
        isSuspicious: true,
        reason: `Dormant account with high activity: ${dailyTxTotal} transactions in a day after ${daysSinceLastActivity} days of inactivity`,
      };
    }
  }

  return {
    ruleName: DORMANT_ACCOUNT_ACTIVITY_RULE_ID,
    isSuspicious: false,
  };
}
