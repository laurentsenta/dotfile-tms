// Note: using an abstract class, to work around the need to move arounds "symbols" linking to interfaces
export abstract class RiskAccounts {
  abstract match(accountNumber: string): boolean;
}
