export interface AccountHistory {
  incDailyTx(account: string, day: string, amount: number): Promise<number>;
  getDailyTxTotal(account: string, day: string): Promise<number>;
  incTxCount(account: string, date: Date, windowMinutes: number): Promise<number>;
  getTxCount(account: string, date: Date, windowMinutes: number): Promise<number>;
}
