export interface AccountHistory {
  incDailyTx(account: string, day: string, amount: number): Promise<number>;
  getDailyTxTotal(account: string, day: string): Promise<number>;
}
