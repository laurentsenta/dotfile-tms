// Note: Using an interface and moving around Symbols would be possible.
export abstract class RiskAccountsRepository {
  abstract match(accountNumber: string): boolean;
}
