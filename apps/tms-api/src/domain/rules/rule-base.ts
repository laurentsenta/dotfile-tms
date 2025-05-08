import { Transaction } from '@dotfile-tms/database';
import { AccountHistory } from '../../data/accounthistory.entity';
import { RiskAccounts } from '../../data/risk-accounts.entity';
import { RuleEvalResult } from '../../data/rule-eval-result.entity';

export type EvaluateRule = ({
  transaction,
  history,
  riskAccounts,
}: {
  transaction: Transaction;
  history: AccountHistory;
  riskAccounts: RiskAccounts;
}) => Promise<RuleEvalResult>;

export interface RuleBase {
  id: string;
  evaluate: EvaluateRule;
}
