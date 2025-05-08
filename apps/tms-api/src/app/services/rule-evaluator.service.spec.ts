import { Rule, Transaction, TransactionTypeEnum } from '@dotfile-tms/database';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InMemoryAccountHistory } from '../../data/accounthistory.mock';
import { AccountHistoryRedisService } from '../../data/accounthistory.service';
import * as suspiciousActivityModule from '../../domain/rules/suspiciousActivity';
import { RuleEvaluatorService } from './rule-evaluator.service';

const DEFAULT_RULE_ID = 'suspicious_activity';

describe('RuleEvaluatorService', () => {
  let service: RuleEvaluatorService;
  let ruleRepository: Repository<Rule>;
  let accountHistoryService: InMemoryAccountHistory;

  beforeEach(async () => {
    accountHistoryService = new InMemoryAccountHistory();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuleEvaluatorService,
        {
          provide: getRepositoryToken(Rule),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: AccountHistoryRedisService,
          useValue: accountHistoryService,
        },
      ],
    }).compile();

    service = module.get<RuleEvaluatorService>(RuleEvaluatorService);
    ruleRepository = module.get<Repository<Rule>>(getRepositoryToken(Rule));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should create default rule if it does not exist', async () => {
      // Mock the findOne method to return null (rule doesn't exist)
      jest.spyOn(ruleRepository, 'findOne').mockResolvedValue(null);

      // Mock the save method
      const saveSpy = jest.spyOn(ruleRepository, 'save').mockResolvedValue({
        id: '1',
        name: DEFAULT_RULE_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
        alerts: [],
      } as Rule);

      // Call onModuleInit
      await service.onModuleInit();

      // Verify findOne was called with the correct parameters
      expect(ruleRepository.findOne).toHaveBeenCalledWith({
        where: { name: DEFAULT_RULE_ID },
      });

      // Verify save was called with a rule object with the correct name
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: DEFAULT_RULE_ID,
        })
      );
    });

    it('should not create default rule if it already exists', async () => {
      // Mock the findOne method to return an existing rule
      jest.spyOn(ruleRepository, 'findOne').mockResolvedValue({
        id: '1',
        name: DEFAULT_RULE_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
        alerts: [],
      } as Rule);

      // Mock the save method
      const saveSpy = jest.spyOn(ruleRepository, 'save');

      // Call onModuleInit
      await service.onModuleInit();

      // Verify findOne was called with the correct parameters
      expect(ruleRepository.findOne).toHaveBeenCalledWith({
        where: { name: DEFAULT_RULE_ID },
      });

      // Verify save was not called
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('inspect', () => {
    it('should call suspiciousActivity with the transaction and account history service', async () => {
      // Create a mock transaction
      const transaction = {
        id: '1',
        amount: 15000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: 'account-123',
        date: new Date('2025-08-05'),
      } as Transaction;

      // Spy on the suspiciousActivity function
      const suspiciousActivitySpy = jest.spyOn(
        suspiciousActivityModule,
        'suspiciousActivity'
      );
      suspiciousActivitySpy.mockReturnValue(
        Promise.resolve({
          isSuspicious: true,
          reason: 'Test reason',
        })
      );

      // Call inspect
      const result = await service.inspect(transaction);

      // Verify suspiciousActivity was called with the transaction and account history service
      expect(suspiciousActivitySpy).toHaveBeenCalledWith(
        transaction,
        accountHistoryService
      );

      // Verify the result
      expect(result.isSuspicious).toBe(true);
      expect(result.reason).toBe('Test reason');
    });
  });
});
