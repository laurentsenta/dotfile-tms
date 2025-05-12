import { RuleType as RuleTypeShared } from '@dotfile-tms/interfaces';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RuleType implements RuleTypeShared {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
