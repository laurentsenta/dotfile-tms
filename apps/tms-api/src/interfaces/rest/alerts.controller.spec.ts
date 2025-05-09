import { Test, TestingModule } from '@nestjs/testing';
import { AlertAggregateService } from '../../data/alert-aggregate.service';
import { AlertsController } from './alerts.controller';

describe('AlertsController', () => {
  let alertsController: AlertsController;
  let alertService: AlertAggregateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [
        {
          provide: AlertAggregateService,
          useValue: {
            listAllAlerts: jest.fn().mockResolvedValue([]),
            getAlertsByTransactionId: jest.fn().mockResolvedValue([]),
            createAlertForTransaction: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    alertsController = module.get<AlertsController>(AlertsController);
    alertService = module.get<AlertAggregateService>(AlertAggregateService);
  });

  describe('listAll', () => {
    it('should return an array of alerts', async () => {
      const result = [];
      jest.spyOn(alertService, 'listAllAlerts').mockImplementation(() => Promise.resolve(result));

      expect(await alertsController.listAll()).toBe(result);
    });
  });

  describe('getByTransactionId', () => {
    it('should return alerts for a transaction', async () => {
      const result = [];
      jest.spyOn(alertService, 'getAlertsByTransactionId').mockImplementation(() => Promise.resolve(result));

      expect(await alertsController.getByTransactionId('test-id')).toBe(result);
    });
  });
});
