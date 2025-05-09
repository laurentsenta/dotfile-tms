import { Transaction } from '@dotfile-tms/database';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { TransactionAggregateService } from '../../data/transaction-aggregate.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@Controller('/v1/transactions')
export class TransactionsController {
  constructor(private readonly transactions: TransactionAggregateService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  listAll(): Promise<Transaction[]> {
    return this.transactions.listAllTransactions();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTransaction(
    @Body() createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    return this.transactions.createTransaction(createTransactionDto);
  }
}
