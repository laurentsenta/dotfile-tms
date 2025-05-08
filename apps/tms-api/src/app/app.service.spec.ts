import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, TransactionTypeEnum, Rule, Alert } from '@dotfile-tms/database';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { RuleEvaluatorService } from './services/rule-evaluator.service';
import { TransactionQueueService } from '../rules/transaction-queue.service';

describe('AppService', () => {
  let service: AppService;
  let mockTransactionRepository: any;
  let mockRuleRepository: any;
  let mockAlertRepository: any;
  let mockRuleEvaluatorService: any;
  let mockTransactionQueueService: any;

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

    mockRuleEvaluatorService = {
      inspect: jest.fn().mockReturnValue({ isSuspicious: false }),
    };

    mockTransactionQueueService = {
      notifyTransactionCreated: jest.fn(),
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
        {
          provide: RuleEvaluatorService,
          useValue: mockRuleEvaluatorService,
        },
        {
          provide: TransactionQueueService,
          useValue: mockTransactionQueueService,
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
    it('should create a transaction, set processed_at, and check for suspicious activity', async () => {
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
      expect(mockRuleEvaluatorService.inspect).toHaveBeenCalled();
    });

    it('should create an alert if transaction is suspicious', async () => {
      const createTransactionDto: CreateTransactionDto = {
        external_id: 'test-external-id',
        date: new Date().toISOString(),
        source_account_key: 'source',
        target_account_key: 'target',
        amount: 15000, // Suspicious amount
        currency: 'USD',
        type: TransactionTypeEnum.CREDIT,
        metadata: {},
      };

      // Mock the transaction save
      const savedTransaction = { 
        id: 'test-id', 
        ...createTransactionDto,
        externalId: createTransactionDto.external_id,
        sourceAccountKey: createTransactionDto.source_account_key,
        targetAccountKey: createTransactionDto.target_account_key,
        processedAt: new Date()
      };
      mockTransactionRepository.save.mockResolvedValue(savedTransaction);
      
      // Mock the rule evaluator to return suspicious
      mockRuleEvaluatorService.inspect.mockReturnValue({ 
        isSuspicious: true, 
        reason: 'Amount exceeds threshold' 
      });
      
      // Mock the rule repository to return a rule
      mockRuleRepository.findOne.mockResolvedValue({ 
        id: 'rule-id', 
        name: 'suspicious_activity' 
      });
      
      // Mock the transaction findOne for alert creation
      mockTransactionRepository.findOne.mockResolvedValue(savedTransaction);

      const result = await service.createTransaction(createTransactionDto);
      
      expect(result).toHaveProperty('id', 'test-id');
      expect(mockRuleEvaluatorService.inspect).toHaveBeenCalledWith(savedTransaction);
      expect(mockRuleRepository.findOne).toHaveBeenCalled();
      expect(mockTransactionRepository.findOne).toHaveBeenCalled();
      expect(mockAlertRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          rule: expect.objectContaining({ id: 'rule-id' }),
          transaction: expect.objectContaining({ id: 'test-id' }),
          status: 'NEW',
          metadata: { reason: 'Amount exceeds threshold' }
        })
      );
    });
  });
});
