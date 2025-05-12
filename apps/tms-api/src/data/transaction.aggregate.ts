import { Transaction } from '@dotfile-tms/database';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionInput } from '../interfaces/dto/create-transaction.input';

const UNIQUE_CONSTRAINT_VIOLATION_CODE = '23505';

@Injectable()
export class TransactionAggregate {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>
  ) {}

  async listAllTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.find();
  }

  async createTransaction(
    createTransaction: CreateTransactionInput
  ): Promise<Transaction> {
    // Map DTO to entity
    const transaction = new Transaction();
    transaction.externalId = createTransaction.externalId;
    transaction.date = new Date(createTransaction.date);
    transaction.sourceAccountKey = createTransaction.sourceAccountKey;
    transaction.targetAccountKey = createTransaction.targetAccountKey;
    transaction.amount = createTransaction.amount;
    transaction.currency = createTransaction.currency;
    transaction.type = createTransaction.type;

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
          `Transaction with external_id '${createTransaction.externalId}' already exists`
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
