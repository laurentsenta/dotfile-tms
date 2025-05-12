import { Injectable } from '@nestjs/common';
import { RiskAccountsRepository } from './risk-accounts.repository';

/**
 * List of high-risk merchant accounts
 * In a production environment, this would likely be stored in a database
 * or loaded from a configuration file
 */
export const HIGH_RISK_ACCOUNTS = [
  'merchant-gambling-001',
  'merchant-crypto-exchange-001',
  'merchant-crypto-exchange-002',
  'merchant-offshore-001',
  'merchant-adult-content-001',
  'merchant-unregulated-gaming-001',
  'merchant-high-value-luxury-001',
  'merchant-anonymous-payments-001',
  'merchant-foreign-shell-001',
  'merchant-sanctioned-country-001',
];

/**
 * Service for checking high-risk merchant accounts
 * Uses a hardcoded list of high-risk merchant accounts
 */
@Injectable()
export class RiskAccountsRepositoryStatic implements RiskAccountsRepository {
  private riskAccounts: Set<string>;

  constructor() {
    this.riskAccounts = new Set(HIGH_RISK_ACCOUNTS);
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
