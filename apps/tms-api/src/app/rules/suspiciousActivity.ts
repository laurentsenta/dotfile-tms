import { Transaction } from '@dotfile-tms/database';

/**
 * Interface for rule evaluation results
 */
export interface EvalResult {
  isSuspicious: boolean;
  reason?: string;
}

/**
 * Checks if a transaction is suspicious based on predefined criteria.
 * Currently, a transaction is considered suspicious if its amount exceeds 10000.
 * 
 * @param transaction The transaction to check
 * @returns An EvalResult indicating if the transaction is suspicious and a reason if it is
 */
export function suspiciousActivity(transaction: Transaction): EvalResult {
  // Check if transaction amount exceeds 10000
  if (transaction.amount > 10000) {
    return {
      isSuspicious: true,
      reason: `Transaction amount (${transaction.amount}) exceeds threshold of 10000`
    };
  }

  return { isSuspicious: false };
}
