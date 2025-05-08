import { Transaction } from '@dotfile-tms/database';
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AppService } from '../../../app/app.service';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { AlertType } from '../types/alert.type';
import { CreateTransactionInput } from '../types/create-transaction.input';
import { TransactionType } from '../types/transaction.type';

@Resolver(() => TransactionType)
export class TransactionResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => [TransactionType])
  async transactions(): Promise<Transaction[]> {
    return this.appService.listAllTransactions();
  }

  @Query(() => TransactionType, { nullable: true })
  async transaction(@Args('id', { type: () => ID }) id: string): Promise<Transaction | null> {
    try {
      const transactions = await this.appService.listAllTransactions();
      return transactions.find(tx => tx.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  @Mutation(() => TransactionType)
  async createTransaction(@Args('input') input: CreateTransactionInput): Promise<Transaction> {
    // Map GraphQL input to DTO
    const createTransactionDto: CreateTransactionDto = {
      external_id: input.externalId,
      date: input.date,
      source_account_key: input.sourceAccountKey,
      target_account_key: input.targetAccountKey,
      amount: input.amount,
      currency: input.currency,
      type: input.type,
    };

    return this.appService.createTransaction(createTransactionDto);
  }

  @ResolveField('alerts', () => [AlertType])
  async getAlerts(@Parent() transaction: Transaction) {
    return this.appService.getAlertsByTransactionId(transaction.id);
  }
}
