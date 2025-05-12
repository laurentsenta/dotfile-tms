import './enums';
import { TransactionTypeEnum } from './enums';

export interface CreateTransactionInput {
  externalId: string;
  date: string;
  sourceAccountKey?: string;
  targetAccountKey?: string;
  amount: number;
  currency: string;
  type: TransactionTypeEnum;
}
