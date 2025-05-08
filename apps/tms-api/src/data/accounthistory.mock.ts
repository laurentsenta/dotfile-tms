import { AccountHistory } from "./accounthistory.entity";

/**
 * In-memory implementation of AccountHistory for testing
 */
export class MockAccountHistory implements AccountHistory {
  private storage: Map<string, number> = new Map();
  private dateStorage: Map<string, string> = new Map();
  private dormantFlags: Map<string, boolean> = new Map();

  async incDailyTx(
    account: string,
    day: string,
    amount: number
  ): Promise<number> {
    const key = `${account}:${day}`;
    const currentAmount = this.storage.get(key) || 0;
    const newAmount = currentAmount + amount;
    this.storage.set(key, newAmount);
    return newAmount;
  }

  async getDailyTxTotal(account: string, day: string): Promise<number> {
    const key = `${account}:${day}`;
    return this.storage.get(key) || 0;
  }

  // Helper method for testing to set a specific daily total
  async setDailyTxTotal(
    account: string,
    day: string,
    amount: number
  ): Promise<void> {
    const key = `${account}:${day}`;
    this.storage.set(key, amount);
  }

  /**
   * Converts a date to a bucketed time window
   * @param date The date to bucket
   * @param windowMinutes The time window in minutes
   * @returns Bucketed timestamp (minutes since epoch, rounded to window)
   */
  private getBucketedTimestamp(date: Date, windowMinutes: number): number {
    const minutesSinceEpoch = Math.floor(date.getTime() / (60 * 1000));
    return Math.floor(minutesSinceEpoch / windowMinutes) * windowMinutes;
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
   * @param account The account to flag activity for
   * @param date The date of the activity
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
   * @param account The account to flag as dormant
   * @param ttl Time-to-live in seconds for the flag (not used in mock)
   */
  async setWasDormant(account: string, ttl: number): Promise<void> {
    const key = `wasdormant:${account}`;
    this.dormantFlags.set(key, true);
  }

  /**
   * Checks if an account was previously flagged as dormant
   * @param account The account to check
   * @returns True if the account was dormant, false otherwise
   */
  async getWasDormant(account: string): Promise<boolean> {
    const key = `wasdormant:${account}`;
    return this.dormantFlags.get(key) || false;
  }

  // Helper method for testing to set a specific last activity date
  async setLastActivity(account: string, date: Date): Promise<void> {
    const key = `lastactivity:${account}`;
    this.dateStorage.set(key, date.toISOString());
  }

  // Helper method for testing to clear dormant flag
  async clearWasDormant(account: string): Promise<void> {
    const key = `wasdormant:${account}`;
    this.dormantFlags.delete(key);
  }
}
