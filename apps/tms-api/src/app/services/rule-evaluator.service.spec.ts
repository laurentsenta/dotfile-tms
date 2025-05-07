import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule } from '@dotfile-tms/database';
import { RuleEvaluatorService } from './rule-evaluator.service';

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
});
