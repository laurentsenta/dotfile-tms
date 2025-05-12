import { Rule } from '@dotfile-tms/database';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_RULES } from '../domain/rules-evaluator';

@Injectable()
export class RulesAggregate implements OnModuleInit {
  constructor(
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>
  ) {}

  public async onModuleInit() {
    await this.createDefaultRulesIfNotExist();
  }

  public async listAllRules(): Promise<Rule[]> {
    return this.ruleRepository.find();
  }

  public async getRuleByName(name: string): Promise<Rule> {
    const rule = await this.ruleRepository.findOne({ where: { name } });
    if (!rule) {
      throw new NotFoundException(`Rule with name ${name} not found`);
    }
    return rule;
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
