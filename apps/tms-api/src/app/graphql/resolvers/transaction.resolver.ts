import { Resolver, Query, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import { TransactionType } from '../types/transaction.type';
import { AlertType } from '../types/alert.type';
import { AppService } from '../../app.service';
import { Transaction } from '@dotfile-tms/database';

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

  @ResolveField('alerts', () => [AlertType])
  async getAlerts(@Parent() transaction: Transaction) {
    return this.appService.getAlertsByTransactionId(transaction.id);
  }
}
