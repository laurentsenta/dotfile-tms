import { Rule, Transaction } from '@dotfile-tms/database';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountHistoryRedisService } from '../../data/accounthistory.service';
import { RiskAccountsService } from '../../data/risk-accounts.service';
import { RuleEvalResult } from '../../data/rule-eval-result.entity';
import { DEFAULT_RULES, evalRules } from '../../domain/rules-evaluator';
import { CreateRuleDto } from '../dto/create-rule.dto';

@Injectable()
export class RuleEvaluatorService implements OnModuleInit {
  constructor(
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
    private accountHistoryService: AccountHistoryRedisService,
    private riskAccountsService: RiskAccountsService
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
    const results: RuleEvalResult[] = await evalRules(
      transaction,
      this.accountHistoryService,
      this.riskAccountsService
    );

    return results;
  }

  private async createDefaultRulesIfNotExist(): Promise<void> {
    for (const defaultRule of DEFAULT_RULES) {
      const existingRule = await this.ruleRepository.findOne({
        where: { name: defaultRule.id },
      });

      // If the rule doesn't exist, create it
      if (!existingRule) {
        const rule = new Rule();
        rule.name = defaultRule.id;
        await this.ruleRepository.save(rule);
      }
    }
  }
}
