import { Rule, Transaction, TransactionTypeEnum } from '@dotfile-tms/database';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InMemoryAccountHistory } from '../../data/accounthistory.mock';
import { AccountHistoryRedisService } from '../../data/accounthistory.service';
import { MockRiskAccounts } from '../../data/risk-accounts.mock';
import { RiskAccountsService } from '../../data/risk-accounts.service';
import { RuleEvaluatorService } from './rule-evaluator.service';
import { suspiciousActivity } from '../../domain/rules/suspicious-activity';
import { highVelocityTransactions } from '../../domain/rules/high-velocity-transactions';
import { highRiskMerchants } from '../../domain/rules/high-risk-merchants';
import { dormantAccountActivity } from '../../domain/rules/dormant-account-activity';
import { evalRules } from '../../domain/rules-evaluator';

// Mock the evalRules function
jest.mock('../../domain/rules-evaluator');

describe('RuleEvaluatorService', () => {
  let service: RuleEvaluatorService;
  let ruleRepository: Repository<Rule>;
  let accountHistoryService: InMemoryAccountHistory;
  let riskAccountsService: MockRiskAccounts;

  beforeEach(async () => {
    accountHistoryService = new InMemoryAccountHistory();
    riskAccountsService = new MockRiskAccounts(['risk-account-1', 'risk-account-2']);

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
        {
          provide: RiskAccountsService,
          useValue: riskAccountsService,
        },
      ],
    }).compile();

    service = module.get<RuleEvaluatorService>(RuleEvaluatorService);
    ruleRepository = module.get<Repository<Rule>>(getRepositoryToken(Rule));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('inspect', () => {
    it('should call evalRules and return the results', async () => {
      // Create a mock transaction
      const transaction = {
        id: '1',
        amount: 15000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER,
        sourceAccountKey: 'account-123',
        targetAccountKey: 'account-456',
        date: new Date('2025-08-05'),
      } as Transaction;

      // Mock the evalRules function
      const mockResults = [
        {
          ruleId: suspiciousActivity.id,
          isSuspicious: true,
          reason: 'Suspicious activity test reason',
        },
        {
          ruleId: highVelocityTransactions.id,
          isSuspicious: false,
        },
        {
          ruleId: highRiskMerchants.id,
          isSuspicious: true,
          reason: 'Transaction involves a high-risk merchant',
        },
        {
          ruleId: dormantAccountActivity.id,
          isSuspicious: false,
        },
      ];
      
      (evalRules as jest.Mock).mockResolvedValue(mockResults);

      // Call inspect
      const results = await service.inspect(transaction);

      // Verify evalRules was called with the correct parameters
      expect(evalRules).toHaveBeenCalledWith(
        transaction,
        accountHistoryService,
        riskAccountsService
      );

      // Verify the results array contains all rule results
      expect(results).toHaveLength(4);
      
      // Check first result (suspicious activity)
      expect(results[0].isSuspicious).toBe(true);
      expect(results[0].reason).toBe('Suspicious activity test reason');
      
      // Check second result (high velocity)
      expect(results[1].isSuspicious).toBe(false);
      
      // Check third result (high risk merchants)
      expect(results[2].isSuspicious).toBe(true);
      expect(results[2].reason).toBe('Transaction involves a high-risk merchant');
      
      // Check fourth result (dormant account activity)
      expect(results[3].isSuspicious).toBe(false);
    });
  });
});
