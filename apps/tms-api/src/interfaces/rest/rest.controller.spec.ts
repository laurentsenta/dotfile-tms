import { Test, TestingModule } from '@nestjs/testing';
import { RestController } from './rest.controller';
import { AppService } from '../../app/app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, Rule, Alert } from '@dotfile-tms/database';
import { RuleEvaluatorService } from '../../app/services/rule-evaluator.service';
import { TransactionQueueService } from '../../rules/transaction-queue.service';

describe('RestController', () => {
  let restController: RestController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestController],
      providers: [
        AppService,
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

    restController = module.get<RestController>(RestController);
    appService = module.get<AppService>(AppService);
  });

  describe('getMessage', () => {
    it('should return "OK"', () => {
      expect(restController.getMessage()).toEqual({ message: 'OK' });
    });
  });
});
