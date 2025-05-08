/**
 * Entity for managing high-risk merchant accounts
 * This provides functionality to check if an account is considered high-risk
 */
export interface RiskAccounts {
  /**
   * Checks if an account number is in the high-risk list
   * @param accountNumber The account number to check
   * @returns True if the account is high-risk, false otherwise
   */
  match(accountNumber: string): boolean;
}
