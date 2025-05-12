import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { RuleType } from './rule.type';
import { TransactionType } from './transaction.type';
import { AlertStatusEnum } from '@dotfile-tms/database';
import { AlertType as AlertTypeShared } from '@dotfile-tms/interfaces';

// Register the enum with GraphQL
registerEnumType(AlertStatusEnum, {
  name: 'AlertStatusEnum',
  description: 'The status of an alert',
});

@ObjectType()
export class AlertType implements AlertTypeShared {
  @Field(() => ID)
  id: string;

  @Field(() => RuleType)
  rule: RuleType;

  @Field(() => TransactionType)
  transaction: TransactionType;

  @Field(() => AlertStatusEnum)
  status: AlertStatusEnum;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
