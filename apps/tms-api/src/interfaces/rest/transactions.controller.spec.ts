import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionAggregateService } from '../../data/transaction-aggregate.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, Rule, Alert } from '@dotfile-tms/database';
import { RulesAggregateService } from '../../data/rules-aggregate.service';
import { TransactionQueueService } from '../../worker/transaction-queue.service';

describe('TransactionsController', () => {
  let transactionsController: TransactionsController;
  let transactionService: TransactionAggregateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        TransactionAggregateService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'test-id', ...entity })),
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: getRepositoryToken(Rule),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'rule-id', ...entity })),
          },
        },
        {
          provide: getRepositoryToken(Alert),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'alert-id', ...entity })),
          },
        },
        {
          provide: RulesAggregateService,
          useValue: {
            inspect: jest.fn().mockReturnValue({ isSuspicious: false }),
            listAllRules: jest.fn().mockResolvedValue([]),
            getRuleByName: jest.fn().mockResolvedValue({}),
            createRule: jest.fn().mockResolvedValue({}),
            onModuleInit: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: TransactionQueueService,
          useValue: {
            notifyTransactionCreated: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    transactionsController = module.get<TransactionsController>(TransactionsController);
    transactionService = module.get<TransactionAggregateService>(TransactionAggregateService);
  });

  describe('listAll', () => {
    it('should return an array of transactions', async () => {
      const result = [];
      jest.spyOn(transactionService, 'listAllTransactions').mockImplementation(() => Promise.resolve(result));

      expect(await transactionsController.listAll()).toBe(result);
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      const createTransactionDto = {
        external_id: 'test-external-id',
        date: new Date().toISOString(),
        source_account_key: 'source',
        target_account_key: 'target',
        amount: 100,
        currency: 'USD',
        type: 'CREDIT' as any,
        metadata: {},
      };
      
      const result = {
        id: 'test-id',
        ...createTransactionDto,
        processedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(transactionService, 'createTransaction').mockImplementation(() => Promise.resolve(result as any));

      expect(await transactionsController.createTransaction(createTransactionDto)).toBe(result);
    });
  });
});
