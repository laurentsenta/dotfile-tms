import { TransactionTypeEnum } from '@dotfile-tms/database';
import { TransactionType as TransactionTypeShared } from '@dotfile-tms/interfaces';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { AlertType } from './alert.type';
import './enums';

@ObjectType()
export class TransactionType implements TransactionTypeShared {
  @Field(() => ID)
  id: string;

  @Field()
  externalId: string;

  @Field()
  date: Date;

  @Field({ nullable: true })
  sourceAccountKey?: string;

  @Field({ nullable: true })
  targetAccountKey?: string;

  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field(() => TransactionTypeEnum)
  type: TransactionTypeEnum;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  processedAt?: Date;

  @Field(() => [AlertType], { nullable: true })
  alerts?: AlertType[];
}
