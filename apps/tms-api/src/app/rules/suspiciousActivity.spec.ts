import { Transaction, TransactionTypeEnum } from '@dotfile-tms/database';
import { suspiciousActivity } from './suspiciousActivity';

describe('suspiciousActivity', () => {
  it('should return isSuspicious=true when transaction amount exceeds 10000', () => {
    // Create a mock transaction with amount > 10000
    const transaction = {
      amount: 15000,
      currency: 'USD',
      type: TransactionTypeEnum.TRANSFER
    } as Transaction;

    const result = suspiciousActivity(transaction);
    
    expect(result.isSuspicious).toBe(true);
    expect(result.reason).toContain('15000');
    expect(result.reason).toContain('exceeds threshold');
  });

  it('should return isSuspicious=false when transaction amount is <= 10000', () => {
    // Create a mock transaction with amount <= 10000
    const transaction = {
      amount: 10000,
      currency: 'USD',
      type: TransactionTypeEnum.TRANSFER
    } as Transaction;

    const result = suspiciousActivity(transaction);
    
    expect(result.isSuspicious).toBe(false);
    expect(result.reason).toBeUndefined();
  });
});
