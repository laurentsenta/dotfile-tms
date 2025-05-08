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
}
