import { registerEnumType } from '@nestjs/graphql';
import { AlertStatusEnum, TransactionTypeEnum } from '@dotfile-tms/database';

registerEnumType(AlertStatusEnum, {
  name: 'AlertStatusEnum',
  description: 'The status of an alert',
});

registerEnumType(TransactionTypeEnum, {
  name: 'TransactionTypeEnum',
  description: 'The type of a transaction',
});
