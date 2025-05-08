import { AccountHistory } from "./accounthistory.entity";

/**
 * In-memory implementation of AccountHistory for testing
 */
export class InMemoryAccountHistory implements AccountHistory {
  private storage: Map<string, number> = new Map();

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
}
