import { Transaction } from '@dotfile-tms/database';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from '../interfaces/dto/create-transaction.dto';

const UNIQUE_CONSTRAINT_VIOLATION_CODE = '23505';

@Injectable()
export class TransactionAggregateService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>
  ) {}

  async listAllTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.find();
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    // Map DTO to entity
    const transaction = new Transaction();
    transaction.externalId = createTransactionDto.external_id;
    transaction.date = new Date(createTransactionDto.date);
    transaction.sourceAccountKey = createTransactionDto.source_account_key;
    transaction.targetAccountKey = createTransactionDto.target_account_key;
    transaction.amount = createTransactionDto.amount;
    transaction.currency = createTransactionDto.currency;
    transaction.type = createTransactionDto.type;
    transaction.metadata = createTransactionDto.metadata;

    transaction.processedAt = new Date();

    try {
      const savedTransaction = await this.transactionRepository.save(
        transaction
      );

      return savedTransaction;
    } catch (error) {
      if (
        error.code === UNIQUE_CONSTRAINT_VIOLATION_CODE &&
        error.detail?.includes('external_id')
      ) {
        throw new ConflictException(
          `Transaction with external_id '${createTransactionDto.external_id}' already exists`
        );
      }
      if (error.code === UNIQUE_CONSTRAINT_VIOLATION_CODE) {
        throw new ConflictException(
          `Transaction with the same unique constraint already exists`
        );
      }

      throw error;
    }
  }
}
