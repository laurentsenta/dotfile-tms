import { Transaction } from '@dotfile-tms/database';
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AlertAggregate } from '../../../data/alert.aggregate';
import { TransactionAggregate } from '../../../data/transaction.aggregate';
import { TransactionQueueService } from '../../../worker/transaction-queue.service';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { AlertType } from '../types/alert.type';
import { CreateTransactionInput } from '../types/create-transaction.input';
import { TransactionType } from '../types/transaction.type';

@Resolver(() => TransactionType)
export class TransactionResolver {
  constructor(
    private readonly txs: TransactionAggregate,
    private readonly alertService: AlertAggregate,
    private readonly queue: TransactionQueueService
  ) {}

  @Query(() => [TransactionType])
  async transactions(): Promise<Transaction[]> {
    return this.txs.listAllTransactions();
  }

  @Query(() => TransactionType, { nullable: true })
  async transaction(
    @Args('id', { type: () => ID }) id: string
  ): Promise<Transaction | null> {
    try {
      const transactions = await this.txs.listAllTransactions();
      return transactions.find((tx) => tx.id === id) || null;
    } catch (error) {
      // TODO: review error handling
      return null;
    }
  }

  @Mutation(() => TransactionType)
  async createTransaction(
    @Args('input') input: CreateTransactionInput
  ): Promise<Transaction> {
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

    // Later: implement a notification system and two-step commit or crash recovery
    const created = await this.txs.createTransaction(createTransactionDto);
    await this.queue.notifyTransactionCreated(created);
    return created;
  }

  @ResolveField('alerts', () => [AlertType])
  async getAlerts(@Parent() transaction: Transaction) {
    return this.alertService.getAlertsByTransactionId(transaction.id);
  }
}
