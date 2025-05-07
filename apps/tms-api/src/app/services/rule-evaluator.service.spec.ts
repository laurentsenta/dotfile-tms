import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule, Transaction, TransactionTypeEnum } from '@dotfile-tms/database';
import { RuleEvaluatorService } from './rule-evaluator.service';
import * as suspiciousActivityModule from '../rules/suspiciousActivity';

const DEFAULT_RULE_ID = 'suspicious_activity';

describe('RuleEvaluatorService', () => {
  let service: RuleEvaluatorService;
  let ruleRepository: Repository<Rule>;

  beforeEach(async () => {
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
        }),
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
    it('should call suspiciousActivity with the transaction', () => {
      // Create a mock transaction
      const transaction = {
        id: '1',
        amount: 15000,
        currency: 'USD',
        type: TransactionTypeEnum.TRANSFER
      } as Transaction;

      // Spy on the suspiciousActivity function
      const suspiciousActivitySpy = jest.spyOn(suspiciousActivityModule, 'suspiciousActivity');
      suspiciousActivitySpy.mockReturnValue({
        isSuspicious: true,
        reason: 'Test reason'
      });

      // Call inspect
      const result = service.inspect(transaction);

      // Verify suspiciousActivity was called with the transaction
      expect(suspiciousActivitySpy).toHaveBeenCalledWith(transaction);
      
      // Verify the result
      expect(result.isSuspicious).toBe(true);
      expect(result.reason).toBe('Test reason');
    });
  });
});
