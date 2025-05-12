import { Transaction } from '@dotfile-tms/database';
import { AccountHistoryRepository } from '../../data/accounthistory.repository';
import { RiskAccounts } from '../../data/risk-accounts.entity';
import { RuleEvalResult } from '../../data/rule-eval-result.entity';

export type EvaluateRule = ({
  transaction,
  history,
  riskAccounts,
}: {
  transaction: Transaction;
  history: AccountHistoryRepository;
  riskAccounts: RiskAccounts;
}) => Promise<RuleEvalResult>;

export interface RuleBase {
  id: string;
  evaluate: EvaluateRule;
}
