import { Transaction, TransactionTypeEnum } from '@dotfile-tms/database';
import { ConflictException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateTransactionDto } from '../interfaces/dto/create-transaction.dto';
import { RuleEvaluatorService } from '../worker/rule-evaluator.service';
import { TransactionQueueService } from '../worker/transaction-queue.service';
import { TransactionAggregateService } from './transaction-aggregate.service';

describe('TransactionAggregateService', () => {
  let service: TransactionAggregateService;
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
        TransactionAggregateService,
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

    service = app.get<TransactionAggregateService>(TransactionAggregateService);
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
      const createTransactionDto: CreateTransactionDto = {
        external_id: 'test-external-id',
        date: new Date().toISOString(),
        source_account_key: 'source',
        target_account_key: 'target',
        amount: 100,
        currency: 'USD',
        type: TransactionTypeEnum.CREDIT,
        metadata: {},
      };

      const result = await service.createTransaction(createTransactionDto);

      expect(result).toHaveProperty('id', 'test-id');
      expect(result).toHaveProperty(
        'externalId',
        createTransactionDto.external_id
      );
      expect(result).toHaveProperty('processedAt');
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when transaction with same external_id exists', async () => {
      const createTransactionDto: CreateTransactionDto = {
        external_id: 'test-external-id',
        date: new Date().toISOString(),
        source_account_key: 'source',
        target_account_key: 'target',
        amount: 100,
        currency: 'USD',
        type: TransactionTypeEnum.CREDIT,
        metadata: {},
      };

      // Mock the repository to throw a unique constraint violation error
      mockTransactionRepository.save.mockRejectedValue({
        code: '23505',
        detail: 'Key (external_id)=(test-external-id) already exists',
      });

      await expect(service.createTransaction(createTransactionDto)).rejects.toThrow(
        ConflictException
      );
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException for other unique constraint violations', async () => {
      const createTransactionDto: CreateTransactionDto = {
        external_id: 'test-external-id',
        date: new Date().toISOString(),
        source_account_key: 'source',
        target_account_key: 'target',
        amount: 100,
        currency: 'USD',
        type: TransactionTypeEnum.CREDIT,
        metadata: {},
      };

      // Mock the repository to throw a unique constraint violation error without detail
      mockTransactionRepository.save.mockRejectedValue({
        code: '23505',
      });

      await expect(service.createTransaction(createTransactionDto)).rejects.toThrow(
        ConflictException
      );
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should rethrow other errors', async () => {
      const createTransactionDto: CreateTransactionDto = {
        external_id: 'test-external-id',
        date: new Date().toISOString(),
        source_account_key: 'source',
        target_account_key: 'target',
        amount: 100,
        currency: 'USD',
        type: TransactionTypeEnum.CREDIT,
        metadata: {},
      };

      // Mock the repository to throw a different error
      const error = new Error('Database connection error');
      mockTransactionRepository.save.mockRejectedValue(error);

      await expect(service.createTransaction(createTransactionDto)).rejects.toThrow(error);
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });
  });

});
