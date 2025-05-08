import { RuleBase } from './rule-base';

const CONFIG = {
  MAX_TRANSACTIONS: 5,
  TIME_WINDOW_MINUTES: 30,
};

/**
 * Checks if a transaction is part of a high velocity pattern
 * A transaction is considered suspicious if there are more than MAX_TRANSACTIONS
 * within the TIME_WINDOW_MINUTES timeframe
 */
export const highVelocityTransactions: RuleBase = {
  id: 'high_velocity_transactions',
  
  evaluate: async ({ transaction, history }) => {
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
        isSuspicious,
        reason: `High velocity detected: ${txCount} transactions in the last ${CONFIG.TIME_WINDOW_MINUTES} minutes`,
      };
    }

    return {
      isSuspicious: false,
    };
  },
};
