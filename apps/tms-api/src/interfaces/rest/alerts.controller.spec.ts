import { Test, TestingModule } from '@nestjs/testing';
import { AlertsController } from './alerts.controller';
import { AppService } from '../../app/app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, Rule, Alert } from '@dotfile-tms/database';
import { RuleEvaluatorService } from '../../app/services/rule-evaluator.service';
import { TransactionQueueService } from '../../rules/transaction-queue.service';

describe('AlertsController', () => {
  let alertsController: AlertsController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
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

    alertsController = module.get<AlertsController>(AlertsController);
    appService = module.get<AppService>(AppService);
  });

  describe('listAll', () => {
    it('should return an array of alerts', async () => {
      const result = [];
      jest.spyOn(appService, 'listAllAlerts').mockImplementation(() => Promise.resolve(result));

      expect(await alertsController.listAll()).toBe(result);
    });
  });

  describe('getByTransactionId', () => {
    it('should return alerts for a transaction', async () => {
      const result = [];
      jest.spyOn(appService, 'getAlertsByTransactionId').mockImplementation(() => Promise.resolve(result));

      expect(await alertsController.getByTransactionId('test-id')).toBe(result);
    });
  });
});
