import { Test, TestingModule } from '@nestjs/testing';
import { RulesController } from './rules.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, Rule, Alert } from '@dotfile-tms/database';
import { RuleEvaluatorService } from '../../app/services/rule-evaluator.service';
import { TransactionQueueService } from '../../rules/transaction-queue.service';

describe('RulesController', () => {
  let rulesController: RulesController;
  let ruleEvaluatorService: RuleEvaluatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RulesController],
      providers: [
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
          provide: RuleEvaluatorService,
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

    rulesController = module.get<RulesController>(RulesController);
    ruleEvaluatorService = module.get<RuleEvaluatorService>(RuleEvaluatorService);
  });

  describe('listAll', () => {
    it('should return an array of rules', async () => {
      const result = [];
      jest.spyOn(ruleEvaluatorService, 'listAllRules').mockImplementation(() => Promise.resolve(result));

      expect(await rulesController.listAll()).toBe(result);
    });
  });

  describe('getByName', () => {
    it('should return a rule by name', async () => {
      const result = { id: 'rule-id', name: 'test-rule' };
      jest.spyOn(ruleEvaluatorService, 'getRuleByName').mockImplementation(() => Promise.resolve(result as any));

      expect(await rulesController.getByName('test-rule')).toBe(result);
    });
  });

  describe('createRule', () => {
    it('should create a rule', async () => {
      const createRuleDto = {
        name: 'test-rule',
      };
      
      const result = {
        id: 'rule-id',
        ...createRuleDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(ruleEvaluatorService, 'createRule').mockImplementation(() => Promise.resolve(result as any));

      expect(await rulesController.createRule(createRuleDto)).toBe(result);
    });
  });
});
