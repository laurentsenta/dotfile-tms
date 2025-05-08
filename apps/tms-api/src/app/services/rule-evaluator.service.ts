import { Rule, Transaction } from '@dotfile-tms/database';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountHistoryRedisService } from '../../data/accounthistory.service';
import { RuleEvalResult } from '../../data/rule-eval-result.entity';
import { suspiciousActivity } from '../../domain/rules/suspicious-activity';
import { highVelocityTransactions } from '../../domain/rules/high-velocity-transactions';
import { CreateRuleDto } from '../dto/create-rule.dto';

export const SUSPICIOUS_ACTIVITY_RULE_ID = 'suspicious_activity';
export const HIGH_VELOCITY_RULE_ID = 'high_velocity_transactions';

export const DEFAULT_RULE_IDS = [
  SUSPICIOUS_ACTIVITY_RULE_ID,
  HIGH_VELOCITY_RULE_ID
];

@Injectable()
export class RuleEvaluatorService implements OnModuleInit {
  constructor(
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
    private accountHistoryService: AccountHistoryRedisService
  ) {}

  async onModuleInit() {
    await this.createDefaultRulesIfNotExist();
  }

  async listAllRules(): Promise<Rule[]> {
    return this.ruleRepository.find();
  }

  async getRuleByName(name: string): Promise<Rule> {
    const rule = await this.ruleRepository.findOne({ where: { name } });
    if (!rule) {
      throw new NotFoundException(`Rule with name ${name} not found`);
    }
    return rule;
  }

  async createRule(createRuleDto: CreateRuleDto): Promise<Rule> {
    const rule = new Rule();
    rule.name = createRuleDto.name;

    return this.ruleRepository.save(rule);
  }

  /**
   * Inspects a transaction for suspicious activity using all available rules
   * @param transaction The transaction to inspect
   * @returns An array of RuleEvalResult indicating if the transaction is suspicious according to any rules
   */
  async inspect(transaction: Transaction): Promise<RuleEvalResult[]> {
    const results: RuleEvalResult[] = [];
    
    // Check suspicious activity rule
    const suspiciousActivityResult = await suspiciousActivity(transaction, this.accountHistoryService);
    results.push(suspiciousActivityResult);
    
    // Check high velocity transactions rule
    const highVelocityResult = await highVelocityTransactions(transaction, this.accountHistoryService);
    results.push(highVelocityResult);
    
    return results;
  }

  /**
   * Creates default rules if they don't exist
   */
  private async createDefaultRulesIfNotExist(): Promise<void> {
    for (const ruleName of DEFAULT_RULE_IDS) {
      // Check if the rule already exists
      const existingRule = await this.ruleRepository.findOne({
        where: { name: ruleName },
      });

      // If the rule doesn't exist, create it
      if (!existingRule) {
        const rule = new Rule();
        rule.name = ruleName;
        await this.ruleRepository.save(rule);
        console.log(`Created default rule: ${ruleName}`);
      } else {
        console.log(`Default rule already exists: ${ruleName}`);
      }
    }
  }
}
