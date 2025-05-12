import { AlertType } from './alert.dto';
import { TransactionTypeEnum } from './enums';

export interface TransactionType {
  id: string;
  externalId: string;
  date: Date;
  sourceAccountKey?: string;
  targetAccountKey?: string;
  amount: number;
  currency: string;
  type: TransactionTypeEnum;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  alerts?: AlertType[];
}
