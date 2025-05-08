export interface AccountHistory {
  incDailyTx(account: string, date: Date, amount: number): Promise<number>;
  getDailyTxTotal(account: string, date: Date): Promise<number>;
  incTxCount(
    account: string,
    date: Date,
    windowMinutes: number
  ): Promise<number>;
  getTxCount(
    account: string,
    date: Date,
    windowMinutes: number
  ): Promise<number>;
  flagActivity(account: string, date: Date): Promise<Date | null>;
  setWasDormant(account: string, ttl: number): Promise<void>;
  getWasDormant(account: string): Promise<boolean>;
}
