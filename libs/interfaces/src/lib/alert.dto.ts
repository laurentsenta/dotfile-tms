import { AlertStatusEnum } from './enums';
import { RuleType } from './rule.dto';
import { TransactionType } from './transaction.dto';

export interface AlertType {
  id: string;
  rule: RuleType;
  transaction: TransactionType;
  status: AlertStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}
