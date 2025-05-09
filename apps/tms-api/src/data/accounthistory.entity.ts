// Note: using an abstract class, to work around the need to move arounds "symbols" linking to interfaces
export abstract class AccountHistory {
  abstract incDailyTx(
    account: string,
    date: Date,
    amount: number
  ): Promise<number>;
  abstract getDailyTxTotal(account: string, date: Date): Promise<number>;
  abstract incTxCount(
    account: string,
    date: Date,
    windowMinutes: number
  ): Promise<number>;
  abstract getTxCount(
    account: string,
    date: Date,
    windowMinutes: number
  ): Promise<number>;
  abstract flagActivity(account: string, date: Date): Promise<Date | null>;
  abstract setWasDormant(account: string, ttl: number): Promise<void>;
  abstract getWasDormant(account: string): Promise<boolean>;
}
