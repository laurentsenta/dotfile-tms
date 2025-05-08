import { InputType, Field, Float } from '@nestjs/graphql';
import { TransactionTypeEnum } from '@dotfile-tms/database';
import './enums';

@InputType()
export class CreateTransactionInput {
  @Field()
  externalId: string;

  @Field()
  date: string;

  @Field({ nullable: true })
  sourceAccountKey?: string;

  @Field({ nullable: true })
  targetAccountKey?: string;

  @Field(() => Float)
  amount: number;

  @Field()
  currency: string;

  @Field(() => TransactionTypeEnum)
  type: TransactionTypeEnum;
}
