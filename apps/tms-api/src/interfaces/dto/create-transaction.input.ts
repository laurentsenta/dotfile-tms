import { TransactionTypeEnum } from '@dotfile-tms/database';
import { CreateTransactionInput as CreateTransactionInputShared } from '@dotfile-tms/interfaces';
import { Field, Float, InputType } from '@nestjs/graphql';
import './enums';

@InputType()
export class CreateTransactionInput implements CreateTransactionInputShared {
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
