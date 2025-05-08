import { Rule, Transaction, TransactionTypeEnum } from '@dotfile-tms/database';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InMemoryAccountHistory } from '../../data/accounthistory.mock';
import { AccountHistoryRedisService } from '../../data/accounthistory.service';
import { RuleEvalResult } from '../../data/rule-eval-result.entity';
import * as suspiciousActivityModule from '../../domain/rules/suspicious-activity';
import * as highVelocityTransactionsModule from '../../domain/rules/high-velocity-transactions';
import { 
  RuleEvaluatorService, 
  SUSPICIOUS_ACTIVITY_RULE_ID, 
  HIGH_VELOCITY_RULE_ID,
  DEFAULT_RULE_IDS
} from './rule-evaluator.service';

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
            find: jest.fn(),
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
    it('should create default rules if they do not exist', async () => {
      // Mock the findOne method to return null (rules don't exist)
      jest.spyOn(ruleRepository, 'findOne').mockResolvedValue(null);

      // Mock the save method
      const saveSpy = jest.spyOn(ruleRepository, 'save').mockImplementation((rule: Rule) => {
        return Promise.resolve({
          id: '1',
          name: rule.name,
          createdAt: new Date(),
          updatedAt: new Date(),
          alerts: [],
        } as Rule);
      });

      // Call onModuleInit
      await service.onModuleInit();

      // Verify findOne was called for both rules
      expect(ruleRepository.findOne).toHaveBeenCalledWith({
        where: { name: SUSPICIOUS_ACTIVITY_RULE_ID },
      });
      expect(ruleRepository.findOne).toHaveBeenCalledWith({
        where: { name: HIGH_VELOCITY_RULE_ID },
      });

      // Verify save was called for both rules
      expect(saveSpy).toHaveBeenCalledTimes(2);
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: SUSPICIOUS_ACTIVITY_RULE_ID,
        })
      );
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: HIGH_VELOCITY_RULE_ID,
        })
      );
    });

    it('should not create rules that already exist', async () => {
      // Mock the findOne method to return existing rules
      jest.spyOn(ruleRepository, 'findOne').mockImplementation((query: any) => {
        const ruleName = query.where.name;
        return Promise.resolve({
          id: '1',
          name: ruleName,
          createdAt: new Date(),
          updatedAt: new Date(),
          alerts: [],
        } as Rule);
      });

      // Mock the save method
      const saveSpy = jest.spyOn(ruleRepository, 'save');

      // Call onModuleInit
      await service.onModuleInit();

      // Verify findOne was called for both rules
      expect(ruleRepository.findOne).toHaveBeenCalledWith({
        where: { name: SUSPICIOUS_ACTIVITY_RULE_ID },
      });
      expect(ruleRepository.findOne).toHaveBeenCalledWith({
        where: { name: HIGH_VELOCITY_RULE_ID },
      });

      // Verify save was not called since both rules exist
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('inspect', () => {
    it('should call both rule functions and return an array of results', async () => {
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
          reason: 'Suspicious activity test reason',
          ruleName: SUSPICIOUS_ACTIVITY_RULE_ID,
        })
      );

      // Spy on the highVelocityTransactions function
      const highVelocitySpy = jest.spyOn(
        highVelocityTransactionsModule,
        'highVelocityTransactions'
      );
      highVelocitySpy.mockReturnValue(
        Promise.resolve({
          isSuspicious: false,
          ruleName: HIGH_VELOCITY_RULE_ID,
        })
      );

      // Call inspect
      const results = await service.inspect(transaction);

      // Verify both rule functions were called with the transaction and account history service
      expect(suspiciousActivitySpy).toHaveBeenCalledWith(
        transaction,
        accountHistoryService
      );
      expect(highVelocitySpy).toHaveBeenCalledWith(
        transaction,
        accountHistoryService
      );

      // Verify the results array contains both rule results
      expect(results).toHaveLength(2);
      
      // Check first result (suspicious activity)
      expect(results[0].isSuspicious).toBe(true);
      expect(results[0].reason).toBe('Suspicious activity test reason');
      expect(results[0].ruleName).toBe(SUSPICIOUS_ACTIVITY_RULE_ID);
      
      // Check second result (high velocity)
      expect(results[1].isSuspicious).toBe(false);
      expect(results[1].ruleName).toBe(HIGH_VELOCITY_RULE_ID);
    });
  });
});
