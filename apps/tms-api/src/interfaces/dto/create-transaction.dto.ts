import { TransactionTypeEnum } from '@dotfile-tms/database';

export class CreateTransactionDto {
  external_id: string;
  date: string;
  source_account_key?: string;
  target_account_key?: string;
  amount: number;
  currency: string;
  type: TransactionTypeEnum;
  metadata?: Record<string, unknown>;
}
