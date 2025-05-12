import { RiskAccountsRepository } from './risk-accounts.repository';

/**
 * In-memory & mutable implementation of RiskAccounts for testing
 */
export class RiskAccountsRepositoryMock implements RiskAccountsRepository {
  private riskAccounts: Set<string>;

  constructor(accounts: string[] = []) {
    this.riskAccounts = new Set(accounts);
  }

  /**
   * Checks if an account number is in the high-risk list
   * @param accountNumber The account number to check
   * @returns True if the account is high-risk, false otherwise
   */
  match(accountNumber: string): boolean {
    return this.riskAccounts.has(accountNumber);
  }
}
