import { Alert, Rule, Transaction } from '@dotfile-tms/database';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RulesAggregateService } from '../../data/rules-aggregate.service';
import { TransactionQueueService } from '../../worker/transaction-queue.service';
import { RulesController } from './rules.controller';

describe('RulesController', () => {
  let rulesController: RulesController;
  let ruleEvaluatorService: RulesAggregateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RulesController],
      providers: [
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            save: jest
              .fn()
              .mockImplementation((entity) =>
                Promise.resolve({ id: 'test-id', ...entity })
              ),
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: getRepositoryToken(Rule),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            save: jest
              .fn()
              .mockImplementation((entity) =>
                Promise.resolve({ id: 'rule-id', ...entity })
              ),
          },
        },
        {
          provide: getRepositoryToken(Alert),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            save: jest
              .fn()
              .mockImplementation((entity) =>
                Promise.resolve({ id: 'alert-id', ...entity })
              ),
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

    rulesController = module.get<RulesController>(RulesController);
    ruleEvaluatorService = module.get<RulesAggregateService>(
      RulesAggregateService
    );
  });

  describe('listAll', () => {
    it('should return an array of rules', async () => {
      const result = [];
      jest
        .spyOn(ruleEvaluatorService, 'listAllRules')
        .mockImplementation(() => Promise.resolve(result));

      expect(await rulesController.listAll()).toBe(result);
    });
  });

  describe('getByName', () => {
    it('should return a rule by name', async () => {
      const result = { id: 'rule-id', name: 'test-rule' };
      jest
        .spyOn(ruleEvaluatorService, 'getRuleByName')
        .mockImplementation(() => Promise.resolve(result as any));

      expect(await rulesController.getByName('test-rule')).toBe(result);
    });
  });
});
