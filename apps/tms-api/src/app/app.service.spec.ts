import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, TransactionTypeEnum, Rule, Alert } from '@dotfile-tms/database';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('AppService', () => {
  let service: AppService;
  let mockTransactionRepository: any;
  let mockRuleRepository: any;
  let mockAlertRepository: any;

  beforeEach(async () => {
    mockTransactionRepository = {
      find: jest.fn().mockResolvedValue([]),
      save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'test-id', ...entity })),
      findOne: jest.fn().mockResolvedValue(null),
    };

    mockRuleRepository = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'rule-id', ...entity })),
    };

    mockAlertRepository = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'alert-id', ...entity })),
    };

    const app = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Rule),
          useValue: mockRuleRepository,
        },
        {
          provide: getRepositoryToken(Alert),
          useValue: mockAlertRepository,
        },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
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
    it('should create a transaction and set processed_at', async () => {
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
      expect(result).toHaveProperty('externalId', createTransactionDto.external_id);
      expect(result).toHaveProperty('processedAt');
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });
  });
});
