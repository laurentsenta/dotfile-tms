import { Transaction, TransactionTypeEnum } from '@dotfile-tms/database';
import { AccountHistoryRepositoryMock } from '../../data/accounthistory.repository.mock';
import { RiskAccountsRepositoryMock } from '../../data/risk-accounts.repository.mock';
import { suspiciousActivity } from './suspicious-activity';
import { toDate } from 'date-fns';

describe('suspiciousActivity', () => {
  let history: AccountHistoryRepositoryMock;
  let riskAccounts: RiskAccountsRepositoryMock;

  beforeEach(() => {
    history = new AccountHistoryRepositoryMock();
    riskAccounts = new RiskAccountsRepositoryMock();
  });

  describe('Single transaction checks', () => {
    it('should return isSuspicious=true when transaction amount exceeds 10000', async () => {
      // Create a mock transaction with amount > 10000
      const transaction = {
        amount: 15000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: 'account-123',
        date: new Date('2025-08-05'),
      } as Transaction;

      const result = await suspiciousActivity.evaluate({
        transaction,
        history,
        riskAccounts,
      });

      expect(result.isSuspicious).toBe(true);
      expect(result.reason).toContain('15000');
      expect(result.reason).toContain('exceeds threshold');
    });

    it('should return isSuspicious=false when transaction amount is <= 10000', async () => {
      // Create a mock transaction with amount <= 10000
      const transaction = {
        amount: 10000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: 'account-123',
        date: new Date('2025-08-05'),
      } as Transaction;

      const result = await suspiciousActivity.evaluate({
        transaction,
        history,
        riskAccounts,
      });

      expect(result.isSuspicious).toBe(false);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('Daily total checks', () => {
    it('should return isSuspicious=true when daily total exceeds 10000 after adding transaction', async () => {
      // Set existing daily total to 8000
      const account = 'account-456';
      const day = '2025-08-05';
      await history.setDailyTxTotal(account, toDate(day), 8000);

      // Create a transaction that would push the daily total over 10000
      const transaction = {
        amount: 3000, // This alone is under the threshold
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: account,
        date: new Date(day),
      } as Transaction;

      const result = await suspiciousActivity.evaluate({
        transaction,
        history,
        riskAccounts,
      });

      expect(result.isSuspicious).toBe(true);
      expect(result.reason).toContain('Daily total');
      expect(result.reason).toContain('11000');
      expect(result.reason).toContain('exceeds threshold');
    });

    it('should return isSuspicious=false when daily total is <= 10000 after adding transaction', async () => {
      // Set existing daily total to 5000
      const account = 'account-789';
      const day = '2025-08-05';
      await history.setDailyTxTotal(account, toDate(day), 5000);

      // Create a transaction that keeps the daily total under 10000
      const transaction = {
        amount: 4000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: account,
        date: new Date(day),
      } as Transaction;

      const result = await suspiciousActivity.evaluate({
        transaction,
        history,
        riskAccounts,
      });

      expect(result.isSuspicious).toBe(false);
      expect(result.reason).toBeUndefined();
    });

    it('should handle multiple transactions on the same day correctly', async () => {
      const account = 'account-multi';
      const day = '2025-08-05';

      // First transaction (3000)
      const transaction1 = {
        amount: 3000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: account,
        date: new Date(day),
      } as Transaction;

      // Should not be suspicious
      const result1 = await suspiciousActivity.evaluate({
        transaction: transaction1,
        history,
        riskAccounts,
      });
      expect(result1.isSuspicious).toBe(false);

      // Second transaction (4000) - total now 7000
      const transaction2 = {
        amount: 4000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: account,
        date: new Date(day),
      } as Transaction;

      // Should still not be suspicious
      const result2 = await suspiciousActivity.evaluate({
        transaction: transaction2,
        history,
        riskAccounts,
      });
      expect(result2.isSuspicious).toBe(false);

      // Third transaction (4000) - total now 11000
      const transaction3 = {
        amount: 4000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: account,
        date: new Date(day),
      } as Transaction;

      // Should be suspicious as total exceeds 10000
      const result3 = await suspiciousActivity.evaluate({
        transaction: transaction3,
        history,
        riskAccounts,
      });
      expect(result3.isSuspicious).toBe(true);
      expect(result3.reason).toContain('Daily total');
      expect(result3.reason).toContain('11000');
    });
  });
});
