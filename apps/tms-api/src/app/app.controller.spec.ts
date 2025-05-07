import { Test, TestingModule } from '@nestjs/testing';
import { AppController, TransactionsController } from './app.controller';
import { AppService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '@dotfile-tms/database';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'test-id', ...entity })),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('getMessage', () => {
    it('should return "OK"', () => {
      expect(appController.getMessage()).toEqual({ message: 'OK' });
    });
  });
});

describe('TransactionsController', () => {
  let transactionsController: TransactionsController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        AppService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'test-id', ...entity })),
          },
        },
      ],
    }).compile();

    transactionsController = module.get<TransactionsController>(TransactionsController);
    appService = module.get<AppService>(AppService);
  });

  describe('listAll', () => {
    it('should return an array of transactions', async () => {
      const result = [];
      jest.spyOn(appService, 'listAllTransactions').mockImplementation(() => Promise.resolve(result));

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
      
      jest.spyOn(appService, 'createTransaction').mockImplementation(() => Promise.resolve(result as any));

      expect(await transactionsController.createTransaction(createTransactionDto)).toBe(result);
    });
  });
});
