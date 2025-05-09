import {
  Alert,
  AlertStatusEnum,
  Rule,
  Transaction,
} from '@dotfile-tms/database';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlertAggregateService } from './alert-aggregate.service';

describe('AlertAggregateService', () => {
  let service: AlertAggregateService;
  let mockTransactionRepository: any;
  let mockRuleRepository: any;
  let mockAlertRepository: any;

  beforeEach(async () => {
    mockTransactionRepository = {
      find: jest.fn().mockResolvedValue([]),
      save: jest
        .fn()
        .mockImplementation((entity) =>
          Promise.resolve({ id: 'test-id', ...entity })
        ),
      findOne: jest.fn().mockResolvedValue(null),
    };

    mockRuleRepository = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      save: jest
        .fn()
        .mockImplementation((entity) =>
          Promise.resolve({ id: 'rule-id', ...entity })
        ),
    };

    mockAlertRepository = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      save: jest
        .fn()
        .mockImplementation((entity) =>
          Promise.resolve({ id: 'alert-id', ...entity })
        ),
    };

    const app = await Test.createTestingModule({
      providers: [
        AlertAggregateService,
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
      ],
    }).compile();

    service = app.get<AlertAggregateService>(AlertAggregateService);
  });

  describe('listAllAlerts', () => {
    it('should return an array of alerts with rule relations', async () => {
      const alerts = [{ id: '1', rule: { id: 'rule-1', name: 'test-rule' } }];
      mockAlertRepository.find.mockResolvedValue(alerts);

      expect(await service.listAllAlerts()).toBe(alerts);
      expect(mockAlertRepository.find).toHaveBeenCalledWith({ relations: ['rule'] });
    });
  });

  describe('getAlertsByTransactionId', () => {
    it('should return alerts for a specific transaction', async () => {
      const transactionId = 'test-transaction-id';
      const alerts = [
        {
          id: '1',
          rule: { id: 'rule-1', name: 'test-rule' },
          transaction: { id: transactionId },
        },
      ];
      mockAlertRepository.find.mockResolvedValue(alerts);

      expect(await service.getAlertsByTransactionId(transactionId)).toBe(alerts);
      expect(mockAlertRepository.find).toHaveBeenCalledWith({
        where: {
          transaction: { id: transactionId },
        },
        relations: ['rule', 'transaction'],
      });
    });
  });

  describe('createAlertForTransaction', () => {
    it('should throw error if rule name is not provided', async () => {
      await expect(service.createAlertForTransaction('test-id')).rejects.toThrow(
        'Rule name is required to create an alert'
      );
    });

    it('should throw NotFoundException if rule is not found', async () => {
      mockRuleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createAlertForTransaction('test-id', 'non-existent-rule')
      ).rejects.toThrow(NotFoundException);
      expect(mockRuleRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'non-existent-rule' },
      });
    });

    it('should throw NotFoundException if transaction is not found', async () => {
      mockRuleRepository.findOne.mockResolvedValue({ id: 'rule-id', name: 'test-rule' });
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createAlertForTransaction('non-existent-id', 'test-rule')
      ).rejects.toThrow(NotFoundException);
      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });

    it('should create an alert for a transaction with a specific rule', async () => {
      const transactionId = 'test-transaction-id';
      const ruleName = 'test-rule';
      const reason = 'Test reason';

      const rule = { id: 'rule-id', name: ruleName };
      const transaction = { id: transactionId };

      mockRuleRepository.findOne.mockResolvedValue(rule);
      mockTransactionRepository.findOne.mockResolvedValue(transaction);
      mockAlertRepository.save.mockImplementation((entity) =>
        Promise.resolve({ id: 'alert-id', ...entity })
      );

      const result = await service.createAlertForTransaction(
        transactionId,
        ruleName,
        reason
      );

      expect(result).toHaveProperty('id', 'alert-id');
      expect(result).toHaveProperty('rule', rule);
      expect(result).toHaveProperty('transaction', transaction);
      expect(result).toHaveProperty('status', AlertStatusEnum.NEW);
      expect(result).toHaveProperty('metadata', { reason });
      expect(mockAlertRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          rule,
          transaction,
          status: AlertStatusEnum.NEW,
          metadata: { reason },
        })
      );
    });

    it('should create an alert without reason if not provided', async () => {
      const transactionId = 'test-transaction-id';
      const ruleName = 'test-rule';

      const rule = { id: 'rule-id', name: ruleName };
      const transaction = { id: transactionId };

      mockRuleRepository.findOne.mockResolvedValue(rule);
      mockTransactionRepository.findOne.mockResolvedValue(transaction);
      mockAlertRepository.save.mockImplementation((entity) =>
        Promise.resolve({ id: 'alert-id', ...entity })
      );

      const result = await service.createAlertForTransaction(transactionId, ruleName);

      expect(result).toHaveProperty('id', 'alert-id');
      expect(result).toHaveProperty('rule', rule);
      expect(result).toHaveProperty('transaction', transaction);
      expect(result).toHaveProperty('status', AlertStatusEnum.NEW);
      expect(result).not.toHaveProperty('metadata');
      expect(mockAlertRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          rule,
          transaction,
          status: AlertStatusEnum.NEW,
        })
      );
    });
  });
});
