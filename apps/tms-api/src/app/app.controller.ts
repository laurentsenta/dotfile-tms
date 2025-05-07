import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Transaction } from '@dotfile-tms/database';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('/v1/health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getMessage() {
    return { message: 'OK' };
  }
}

@Controller('/v1/transactions')
export class TransactionsController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  listAll(): Promise<Transaction[]> {
    return this.appService.listAllTransactions();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTransaction(
    @Body() createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    return this.appService.createTransaction(createTransactionDto);
  }
}
