import { Transaction } from '@dotfile-tms/database';
import { AccountHistoryRepository } from '../../data/accounthistory.repository';
import { RiskAccountsRepository } from '../../data/risk-accounts.repository';
import { RuleEvalResult } from '../../data/rule-eval-result.entity';

export type EvaluateRule = ({
  transaction,
  history,
  riskAccounts,
}: {
  transaction: Transaction;
  history: AccountHistoryRepository;
  riskAccounts: RiskAccountsRepository;
}) => Promise<RuleEvalResult>;

export interface RuleBase {
  id: string;
  evaluate: EvaluateRule;
}
