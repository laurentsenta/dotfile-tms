import { Transaction } from '@dotfile-tms/database';
import { InMemoryAccountHistory } from '../../data/accounthistory.mock';
import { MockRiskAccounts } from '../../data/risk-accounts.mock';
import { dormantAccountActivity } from './dormant-account-activity';

describe('dormantAccountActivity', () => {
  let history: InMemoryAccountHistory;
  let riskAccounts: MockRiskAccounts;
  let transaction: Transaction;

  const sourceAccount = 'account123';
  const targetAccount = 'merchant456';
  const currentDate = new Date('2023-01-15T12:00:00Z');

  beforeEach(() => {
    history = new InMemoryAccountHistory();
    riskAccounts = new MockRiskAccounts();

    transaction = {
      id: '1',
      externalId: 'ext1',
      date: currentDate.toISOString(),
      sourceAccountKey: sourceAccount,
      targetAccountKey: targetAccount,
      amount: 100,
      currency: 'USD',
      type: 'payment',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      processedAt: null,
      alerts: [],
    } as unknown as Transaction;
  });

  it('should flag a transaction as not suspicious for a new account', async () => {
    // No previous activity for this account
    const result = await dormantAccountActivity.evaluate({
      transaction,
      history,
      riskAccounts,
    });

    expect(result.isSuspicious).toBe(false);
  });

  it('should flag a transaction as not suspicious for an active account', async () => {
    // Set previous activity 30 days ago (less than threshold)
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 30);
    await history.setLastActivity(sourceAccount, previousDate);

    const result = await dormantAccountActivity.evaluate({
      transaction,
      history,
      riskAccounts,
    });

    expect(result.isSuspicious).toBe(false);
  });

  it('should set dormant flag for a dormant account', async () => {
    // Set previous activity 100 days ago (more than threshold)
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 100);
    await history.setLastActivity(sourceAccount, previousDate);

    const result = await dormantAccountActivity.evaluate({
      transaction,
      history,
      riskAccounts,
    });

    // The transaction itself is not suspicious, but the account should be flagged as dormant
    expect(result.isSuspicious).toBe(false);

    // Check that the dormant flag was set
    const wasDormant = await history.getWasDormant(sourceAccount);
    expect(wasDormant).toBe(true);
  });

  it('should flag a transaction as suspicious for a previously dormant account with high activity', async () => {
    // Set account as previously dormant
    await history.setWasDormant(sourceAccount, 3600);

    // Set daily transaction total above threshold
    const day = currentDate.toISOString().split('T')[0];
    await history.setDailyTxTotal(sourceAccount, day, 6);

    // Set previous activity 10 days ago (account is no longer dormant)
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 10);
    await history.setLastActivity(sourceAccount, previousDate);

    const result = await dormantAccountActivity.evaluate({
      transaction,
      history,
      riskAccounts,
    });

    expect(result.isSuspicious).toBe(true);
    expect(result.reason).toContain('Dormant account with high activity');
  });

  it('should not flag a transaction as suspicious for a previously dormant account with low activity', async () => {
    // Set account as previously dormant
    await history.setWasDormant(sourceAccount, 3600);

    // Set daily transaction total below threshold
    const day = currentDate.toISOString().split('T')[0];
    await history.setDailyTxTotal(sourceAccount, day, 3);

    // Set previous activity 10 days ago (account is no longer dormant)
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 10);
    await history.setLastActivity(sourceAccount, previousDate);

    const result = await dormantAccountActivity.evaluate({
      transaction,
      history,
      riskAccounts,
    });

    expect(result.isSuspicious).toBe(false);
  });

  it('should update the last activity date', async () => {
    // Set previous activity 10 days ago
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 10);
    await history.setLastActivity(sourceAccount, previousDate);

    await dormantAccountActivity.evaluate({
      transaction,
      history,
      riskAccounts,
    });

    // Check that flagActivity was called with the correct parameters
    // We can't directly check this with the mock, but we can check the side effect
    // by getting the last activity date from the mock
    const key = `lastactivity:${sourceAccount}`;
    const storedDate = history['dateStorage'].get(key);
    expect(storedDate).toBe(currentDate.toISOString());
  });
});
