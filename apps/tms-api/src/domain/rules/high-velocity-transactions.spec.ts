import { Transaction, TransactionTypeEnum } from '@dotfile-tms/database';
import { AccountHistoryRepositoryMock } from '../../data/accounthistory.repository.mock';
import { RiskAccountsRepositoryMock } from '../../data/risk-accounts.repository.mock';
import { highVelocityTransactions } from './high-velocity-transactions';

describe('highVelocityTransactions', () => {
  let history: AccountHistoryRepositoryMock;
  let riskAccounts: RiskAccountsRepositoryMock;

  beforeEach(() => {
    history = new AccountHistoryRepositoryMock();
    riskAccounts = new RiskAccountsRepositoryMock();
  });

  it('should return isSuspicious=false for the first few transactions within the time window', async () => {
    const baseDate = new Date('2025-08-05T14:15:00Z');
    const account = 'account-velocity-1';

    // Create 5 transactions (at the threshold limit)
    for (let i = 0; i < 5; i++) {
      const transaction = {
        amount: 1000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: account,
        // All transactions within the same 30-minute window
        date: new Date(baseDate.getTime() + i * 60000), // 1 minute apart
      } as Transaction;

      const result = await highVelocityTransactions.evaluate({
        transaction,
        history,
        riskAccounts,
      });

      // First 5 transactions should not be suspicious
      expect(result.isSuspicious).toBe(false);
      expect(result.reason).toBeUndefined();
    }
  });

  it('should return isSuspicious=true when exceeding the transaction threshold in a time window', async () => {
    const baseDate = new Date('2025-08-05T14:15:00Z');
    const account = 'account-velocity-2';

    // Create 6 transactions (exceeding the threshold of 5)
    for (let i = 0; i < 6; i++) {
      const transaction = {
        amount: 1000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: account,
        // All transactions within the same 30-minute window
        date: new Date(baseDate.getTime() + i * 60000), // 1 minute apart
      } as Transaction;

      const result = await highVelocityTransactions.evaluate({
        transaction,
        history,
        riskAccounts,
      });

      // First 5 transactions should not be suspicious
      if (i < 5) {
        expect(result.isSuspicious).toBe(false);
        expect(result.reason).toBeUndefined();
      } else {
        // 6th transaction should be suspicious
        expect(result.isSuspicious).toBe(true);
        expect(result.reason).toContain('High velocity detected');
        expect(result.reason).toContain(`${i + 1} transactions`);
      }
    }
  });

  it('should handle transactions in different time windows correctly', async () => {
    const account = 'account-velocity-3';

    // First time window: 14:00-14:30
    const firstWindowDate = new Date('2025-08-05T14:15:00Z');

    // Create 5 transactions in the first window (at threshold)
    for (let i = 0; i < 5; i++) {
      const transaction = {
        amount: 1000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: account,
        date: new Date(firstWindowDate.getTime() + i * 60000), // 1 minute apart
      } as Transaction;

      const result = await highVelocityTransactions.evaluate({
        transaction,
        history,
        riskAccounts,
      });
      expect(result.isSuspicious).toBe(false);
    }

    // Second time window: 14:30-15:00
    const secondWindowDate = new Date('2025-08-05T14:35:00Z');

    // Create 5 more transactions in the second window (should reset counter)
    for (let i = 0; i < 5; i++) {
      const transaction = {
        amount: 1000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: account,
        date: new Date(secondWindowDate.getTime() + i * 60000), // 1 minute apart
      } as Transaction;

      const result = await highVelocityTransactions.evaluate({
        transaction,
        history,
        riskAccounts,
      });
      expect(result.isSuspicious).toBe(false);
    }

    // Add one more transaction to the second window (exceeding threshold)
    const sixthTransaction = {
      amount: 1000,
      currency: 'USD',
      type: TransactionTypeEnum.TRANSFER,
      sourceAccountKey: account,
      date: new Date(secondWindowDate.getTime() + 5 * 60000),
    } as Transaction;

    const result = await highVelocityTransactions.evaluate({
      transaction: sixthTransaction,
      history,
      riskAccounts,
    });
    expect(result.isSuspicious).toBe(true);
    expect(result.reason).toContain('High velocity detected');
  });

  it('should handle transactions from different accounts separately', async () => {
    const baseDate = new Date('2025-08-05T14:15:00Z');
    const account1 = 'account-velocity-4';
    const account2 = 'account-velocity-5';

    // Create 5 transactions for account1 (at threshold)
    for (let i = 0; i < 5; i++) {
      const transaction = {
        amount: 1000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: account1,
        date: new Date(baseDate.getTime() + i * 60000), // 1 minute apart
      } as Transaction;

      const result = await highVelocityTransactions.evaluate({
        transaction,
        history,
        riskAccounts,
      });
      expect(result.isSuspicious).toBe(false);
    }

    // Create 5 transactions for account2 (should be separate counter)
    for (let i = 0; i < 5; i++) {
      const transaction = {
        amount: 1000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: account2,
        date: new Date(baseDate.getTime() + i * 60000), // 1 minute apart
      } as Transaction;

      const result = await highVelocityTransactions.evaluate({
        transaction,
        history,
        riskAccounts,
      });
      expect(result.isSuspicious).toBe(false);
    }

    // Add one more transaction to account1 (exceeding threshold)
    const sixthTransaction = {
      amount: 1000,
      currency: 'USD',
      type: TransactionTypeEnum.TRANSFER,
      sourceAccountKey: account1,
      date: new Date(baseDate.getTime() + 5 * 60000),
    } as Transaction;

    const result = await highVelocityTransactions.evaluate({
      transaction: sixthTransaction,
      history,
      riskAccounts,
    });
    expect(result.isSuspicious).toBe(true);
    expect(result.reason).toContain('High velocity detected');
  });
});
