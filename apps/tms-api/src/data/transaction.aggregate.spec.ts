import { Transaction, TransactionTypeEnum } from '@dotfile-tms/database';
import { ConflictException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateTransactionInput } from '../interfaces/dto/create-transaction.input';
import { RuleEvaluatorService } from '../worker/rule-evaluator.service';
import { TransactionQueueService } from '../worker/transaction-queue.service';
import { TransactionAggregate } from './transaction.aggregate';

describe('TransactionAggregateService', () => {
  let service: TransactionAggregate;
  let mockTransactionRepository: any;

  beforeEach(async () => {
    mockTransactionRepository = {
      find: jest.fn().mockResolvedValue([]),
      save: jest
        .fn()
        .mockImplementation((entity) =>
          Promise.resolve({ id: 'test-id', ...entity })
        ),
      findOne: jest.fn().mockResolvedValue(null),
    };


    // Create mocks for TransactionQueueService dependencies
    const mockQueue = {
      add: jest.fn(),
    };

    const mockRuleEvaluator = {
      inspect: jest.fn().mockResolvedValue([]),
    };

    const app = await Test.createTestingModule({
      providers: [
        TransactionAggregate,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getQueueToken('transactions'),
          useValue: mockQueue,
        },
        {
          provide: RuleEvaluatorService,
          useValue: mockRuleEvaluator,
        },
        TransactionQueueService,
      ],
    }).compile();

    service = app.get<TransactionAggregate>(TransactionAggregate);
  });

  describe('listAllTransactions', () => {
    it('should return an array of transactions', async () => {
      const transactions = [{ id: '1', externalId: 'ext-1' }];
      mockTransactionRepository.find.mockResolvedValue(transactions);

      expect(await service.listAllTransactions()).toBe(transactions);
      expect(mockTransactionRepository.find).toHaveBeenCalled();
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction, set processed_at, and notify transaction queue', async () => {
      const createTransactionInput: CreateTransactionInput = {
        externalId: 'test-external-id',
        date: new Date().toISOString(),
        sourceAccountKey: 'source',
        targetAccountKey: 'target',
        amount: 100,
        currency: 'USD',
        type: TransactionTypeEnum.CREDIT,
      };

      const result = await service.createTransaction(createTransactionInput);

      expect(result).toHaveProperty('id', 'test-id');
      expect(result).toHaveProperty(
        'externalId',
        createTransactionInput.externalId
      );
      expect(result).toHaveProperty('processedAt');
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when transaction with same external_id exists', async () => {
      const createTransactionInput: CreateTransactionInput = {
        externalId: 'test-external-id',
        date: new Date().toISOString(),
        sourceAccountKey: 'source',
        targetAccountKey: 'target',
        amount: 100,
        currency: 'USD',
        type: TransactionTypeEnum.CREDIT,
      };

      // Mock the repository to throw a unique constraint violation error
      mockTransactionRepository.save.mockRejectedValue({
        code: '23505',
        detail: 'Key (external_id)=(test-external-id) already exists',
      });

      await expect(service.createTransaction(createTransactionInput)).rejects.toThrow(
        ConflictException
      );
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException for other unique constraint violations', async () => {
      const createTransactionInput: CreateTransactionInput = {
        externalId: 'test-external-id',
        date: new Date().toISOString(),
        sourceAccountKey: 'source',
        targetAccountKey: 'target',
        amount: 100,
        currency: 'USD',
        type: TransactionTypeEnum.CREDIT,
      };

      // Mock the repository to throw a unique constraint violation error without detail
      mockTransactionRepository.save.mockRejectedValue({
        code: '23505',
      });

      await expect(service.createTransaction(createTransactionInput)).rejects.toThrow(
        ConflictException
      );
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should rethrow other errors', async () => {
      const createTransactionInput: CreateTransactionInput = {
        externalId: 'test-external-id',
        date: new Date().toISOString(),
        sourceAccountKey: 'source',
        targetAccountKey: 'target',
        amount: 100,
        currency: 'USD',
        type: TransactionTypeEnum.CREDIT,
      };

      // Mock the repository to throw a different error
      const error = new Error('Database connection error');
      mockTransactionRepository.save.mockRejectedValue(error);

      await expect(service.createTransaction(createTransactionInput)).rejects.toThrow(error);
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });
  });

});
