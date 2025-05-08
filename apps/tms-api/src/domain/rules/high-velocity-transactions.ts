import { Transaction } from '@dotfile-tms/database';
import { AccountHistory } from '../../data/accounthistory.entity';
import { RuleEvalResult } from '../../data/rule-eval-result.entity';

export const HIGH_VELOCITY_RULE_ID = 'high_velocity_transactions';

const CONFIG = {
  MAX_TRANSACTIONS: 5,
  TIME_WINDOW_MINUTES: 30,
};

export async function highVelocityTransactions(
  transaction: Transaction,
  history: AccountHistory
): Promise<RuleEvalResult> {
  // Increment the transaction count for the current time window
  const txCount = await history.incTxCount(
    transaction.sourceAccountKey,
    new Date(transaction.date),
    CONFIG.TIME_WINDOW_MINUTES
  );

  // Check if the transaction count exceeds the threshold
  const isSuspicious = txCount > CONFIG.MAX_TRANSACTIONS;

  // TODO: to be more precise, we'd need to use smaller buckets (something like TIME_WINDOWS_MINUTES / 2)
  // and check the before and after
  if (isSuspicious) {
    return {
      ruleName: HIGH_VELOCITY_RULE_ID,
      isSuspicious,
      reason: `High velocity detected: ${txCount} transactions in the last ${CONFIG.TIME_WINDOW_MINUTES} minutes`,
    };
  }

  return {
    ruleName: HIGH_VELOCITY_RULE_ID,
    isSuspicious: false,
  };
}
