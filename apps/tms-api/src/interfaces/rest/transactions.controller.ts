import { Transaction } from '@dotfile-tms/database';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { TransactionAggregate } from '../../data/transaction.aggregate';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionQueueService } from '../../worker/transaction-queue.service';

@Controller('/v1/transactions')
export class TransactionsController {
  constructor(
    private readonly transactions: TransactionAggregate,
    private readonly queue: TransactionQueueService
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  listAll(): Promise<Transaction[]> {
    return this.transactions.listAllTransactions();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    // Later: implement a notification system and two-step commit or crash recovery
    const created = await this.transactions.createTransaction(
      createTransactionDto
    );
    await this.queue.notifyTransactionCreated(created);
    return created;
  }
}
