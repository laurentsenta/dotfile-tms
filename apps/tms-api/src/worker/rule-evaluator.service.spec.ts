import { Transaction, TransactionTypeEnum } from '@dotfile-tms/database';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountHistoryRepository } from '../data/accounthistory.repository';
import { AccountHistoryRepositoryMock } from '../data/accounthistory.repository.mock';
import { AlertAggregateService } from '../data/alert-aggregate.service';
import { RiskAccounts } from '../data/risk-accounts.entity';
import { MockRiskAccounts } from '../data/risk-accounts.mock';
import { evalRules } from '../domain/rules-evaluator';
import { dormantAccountActivity } from '../domain/rules/dormant-account-activity';
import { highRiskMerchants } from '../domain/rules/high-risk-merchants';
import { highVelocityTransactions } from '../domain/rules/high-velocity-transactions';
import { suspiciousActivity } from '../domain/rules/suspicious-activity';
import { RuleEvaluatorService } from './rule-evaluator.service';

// Mock the evalRules function
jest.mock('../domain/rules-evaluator');

describe('RuleEvaluatorService', () => {
  let service: RuleEvaluatorService;
  let alertService: AlertAggregateService;
  let accountHistoryMock: AccountHistoryRepositoryMock;
  let riskAccountsMock: MockRiskAccounts;

  beforeEach(async () => {
    accountHistoryMock = new AccountHistoryRepositoryMock();
    riskAccountsMock = new MockRiskAccounts([
      'risk-account-1',
      'risk-account-2',
    ]);

    // Create mock for AlertAggregateService
    const mockAlertAggregateService = {
      createAlertForTransaction: jest.fn().mockResolvedValue({
        id: 'alert-1',
        rule: { id: 'rule-1', name: 'suspicious_activity' },
        transaction: { id: '1' },
        status: 'NEW',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuleEvaluatorService,
        {
          provide: AlertAggregateService,
          useValue: mockAlertAggregateService,
        },
        {
          provide: AccountHistoryRepository,
          useValue: accountHistoryMock,
        },
        {
          provide: RiskAccounts,
          useValue: riskAccountsMock,
        },
      ],
    }).compile();

    service = module.get<RuleEvaluatorService>(RuleEvaluatorService);
    alertService = module.get<AlertAggregateService>(AlertAggregateService);
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

      // Verify createAlertForTransaction was called for suspicious rules
      expect(alertService.createAlertForTransaction).toHaveBeenCalledWith(
        transaction.id,
        suspiciousActivity.id,
        'Suspicious activity test reason'
      );
      expect(alertService.createAlertForTransaction).toHaveBeenCalledWith(
        transaction.id,
        highRiskMerchants.id,
        'Transaction involves a high-risk merchant'
      );

      // Verify evalRules was called with the correct parameters
      expect(evalRules).toHaveBeenCalledWith(
        transaction,
        accountHistoryMock,
        riskAccountsMock
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
      expect(results[2].reason).toBe(
        'Transaction involves a high-risk merchant'
      );

      // Check fourth result (dormant account activity)
      expect(results[3].isSuspicious).toBe(false);
    });
  });
});
