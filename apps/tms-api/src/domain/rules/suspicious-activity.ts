import { Transaction } from '@dotfile-tms/database';
import { AccountHistory } from '../../data/accounthistory.entity';

/**
 * Interface for rule evaluation results
 */
export interface EvalResult {
  isSuspicious: boolean;
  reason?: string;
}

/**
 * Threshold amount for suspicious activity detection
 */
const THRESHOLD = 10000;

/**
 * Formats a date object to YYYY-MM-DD string format
 * @param date The date to format
 * @returns Formatted date string
 */
function formatDateToDay(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Checks if a transaction is suspicious based on predefined criteria.
 * A transaction is considered suspicious if:
 * 1. Its individual amount exceeds the threshold (10000)
 * 2. The total amount for the account on that day (including this transaction) exceeds the threshold
 *
 * @param transaction The transaction to check
 * @param history The account history service to check daily totals
 * @returns An EvalResult indicating if the transaction is suspicious and a reason if it is
 */
export async function suspiciousActivity(
  transaction: Transaction,
  history: AccountHistory
): Promise<EvalResult> {
  // Check if individual transaction amount exceeds threshold
  if (transaction.amount > THRESHOLD) {
    return {
      isSuspicious: true,
      reason: `Transaction amount (${transaction.amount}) exceeds threshold of ${THRESHOLD}`,
    };
  }

  // Check daily total including this transaction
  const account = transaction.sourceAccountKey;
  const day = formatDateToDay(transaction.date);
  
  // Increment the daily total with this transaction's amount
  const newDailyTotal = await history.incDailyTx(account, day, transaction.amount);
  
  // Check if the new daily total exceeds the threshold
  if (newDailyTotal > THRESHOLD) {
    return {
      isSuspicious: true,
      reason: `Daily total (${newDailyTotal}) for account ${account} on ${day} exceeds threshold of ${THRESHOLD}`,
    };
  }

  return { isSuspicious: false };
}
