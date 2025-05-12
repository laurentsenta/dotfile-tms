import { differenceInMinutes, format, formatISO } from 'date-fns';
import { AccountHistoryRepository } from './accounthistory.repository';

/**
 * In-memory implementation of AccountHistory for testing
 */
export class AccountHistoryRepositoryMock implements AccountHistoryRepository {
  private storage: Map<string, number> = new Map();
  private dateStorage: Map<string, string> = new Map();
  private dormantFlags: Map<string, boolean> = new Map();

  private getBucketedTimestamp(date: Date, windowMinutes: number): number {
    const minutesSinceEpoch = differenceInMinutes(date, new Date(0));
    return Math.floor(minutesSinceEpoch / windowMinutes) * windowMinutes;
  }

  async incDailyTx(
    account: string,
    date: Date,
    amount: number
  ): Promise<number> {
    const day = format(date, 'yyyy-MM-dd');
    const key = `${account}:${day}`;
    const currentAmount = this.storage.get(key) || 0;
    const newAmount = currentAmount + amount;
    this.storage.set(key, newAmount);
    return newAmount;
  }

  async getDailyTxTotal(account: string, date: Date): Promise<number> {
    const day = format(date, 'yyyy-MM-dd');
    const key = `${account}:${day}`;
    return this.storage.get(key) || 0;
  }

  // Helper method for testing to set a specific daily total
  async setDailyTxTotal(
    account: string,
    date: Date,
    amount: number
  ): Promise<void> {
    const day = format(date, 'yyyy-MM-dd');
    const key = `${account}:${day}`;
    this.storage.set(key, amount);
  }

  async incTxCount(
    account: string,
    date: Date,
    windowMinutes: number
  ): Promise<number> {
    const bucketedTimestamp = this.getBucketedTimestamp(date, windowMinutes);
    const key = `velocity:${account}:${bucketedTimestamp}`;
    const currentCount = this.storage.get(key) || 0;
    const newCount = currentCount + 1;
    this.storage.set(key, newCount);
    return newCount;
  }

  async getTxCount(
    account: string,
    date: Date,
    windowMinutes: number
  ): Promise<number> {
    const bucketedTimestamp = this.getBucketedTimestamp(date, windowMinutes);
    const key = `velocity:${account}:${bucketedTimestamp}`;
    return this.storage.get(key) || 0;
  }

  // Helper method for testing to set a specific transaction count
  async setTxCount(
    account: string,
    date: Date,
    windowMinutes: number,
    count: number
  ): Promise<void> {
    const bucketedTimestamp = this.getBucketedTimestamp(date, windowMinutes);
    const key = `velocity:${account}:${bucketedTimestamp}`;
    this.storage.set(key, count);
  }

  /**
   * Flags account activity by updating the last activity date
   * @returns The previous last activity date, or null if no previous activity
   */
  async flagActivity(account: string, date: Date): Promise<Date | null> {
    const key = `lastactivity:${account}`;
    const previousValue = this.dateStorage.get(key);

    // Store the new date
    this.dateStorage.set(key, date.toISOString());

    return previousValue ? new Date(previousValue) : null;
  }

  /**
   * Sets a flag indicating the account was dormant
   */
  async setWasDormant(account: string, ttl: number): Promise<void> {
    const key = `wasdormant:${account}`;
    this.dormantFlags.set(key, true);
  }

  /**
   * Checks if an account was previously flagged as dormant
   */
  async getWasDormant(account: string): Promise<boolean> {
    const key = `wasdormant:${account}`;
    return this.dormantFlags.get(key) || false;
  }

  // Helper method for testing to set a specific last activity date
  async setLastActivity(account: string, date: Date): Promise<void> {
    const key = `lastactivity:${account}`;
    this.dateStorage.set(key, formatISO(date));
  }

  // Helper method for testing to clear dormant flag
  async clearWasDormant(account: string): Promise<void> {
    const key = `wasdormant:${account}`;
    this.dormantFlags.delete(key);
  }
}
