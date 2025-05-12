import { Transaction, TransactionTypeEnum } from '@dotfile-tms/database';
import { AccountHistoryRepositoryMock } from '../../data/accounthistory.repository.mock';
import { RiskAccountsRepositoryMock } from '../../data/risk-accounts.repository.mock';
import { highRiskMerchants } from './high-risk-merchants';

describe('highRiskMerchants', () => {
  let riskAccounts: RiskAccountsRepositoryMock;
  let history: AccountHistoryRepositoryMock;

  beforeEach(() => {
    riskAccounts = new RiskAccountsRepositoryMock([
      'merchant-gambling-001',
      'merchant-crypto-exchange-001',
      'merchant-offshore-001',
    ]);
    history = new AccountHistoryRepositoryMock();
  });

  it('should return isSuspicious=true when target account is a high-risk merchant', async () => {
    const transaction = {
      amount: 1000,
      currency: 'USD',
      type: TransactionTypeEnum.TRANSFER,
      sourceAccountKey: 'regular-account-001',
      targetAccountKey: 'merchant-gambling-001',
      date: new Date('2025-08-05'),
    } as Transaction;

    const result = await highRiskMerchants.evaluate({
      transaction,
      riskAccounts,
      history,
    });

    expect(result.isSuspicious).toBe(true);
    expect(result.reason).toContain('merchant-gambling-001');
  });

  it('should return isSuspicious=true when source account is a high-risk merchant', async () => {
    const transaction = {
      amount: 1000,
      currency: 'USD',
      type: TransactionTypeEnum.TRANSFER,
      sourceAccountKey: 'merchant-crypto-exchange-001',
      targetAccountKey: 'regular-account-001',
      date: new Date('2025-08-05'),
    } as Transaction;

    const result = await highRiskMerchants.evaluate({
      transaction,
      riskAccounts,
      history,
    });

    expect(result.isSuspicious).toBe(true);
    expect(result.reason).toContain('merchant-crypto-exchange-001');
  });

  it('should return isSuspicious=false when neither account is a high-risk merchant', async () => {
    const transaction = {
      amount: 1000,
      currency: 'USD',
      type: TransactionTypeEnum.TRANSFER,
      sourceAccountKey: 'regular-account-001',
      targetAccountKey: 'regular-account-002',
      date: new Date('2025-08-05'),
    } as Transaction;

    const result = await highRiskMerchants.evaluate({
      transaction,
      riskAccounts,
      history,
    });

    expect(result.isSuspicious).toBe(false);
    expect(result.reason).toBeUndefined();
  });

  it('should prioritize target account when both accounts are high-risk merchants', async () => {
    const transaction = {
      amount: 1000,
      currency: 'USD',
      type: TransactionTypeEnum.TRANSFER,
      sourceAccountKey: 'merchant-crypto-exchange-001',
      targetAccountKey: 'merchant-gambling-001',
      date: new Date('2025-08-05'),
    } as Transaction;

    const result = await highRiskMerchants.evaluate({
      transaction,
      riskAccounts,
      history,
    });

    expect(result.isSuspicious).toBe(true);
    expect(result.reason).toContain('merchant-gambling-001');
  });
});
