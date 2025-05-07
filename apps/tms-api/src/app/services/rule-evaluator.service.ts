import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule } from '@dotfile-tms/database';
import { CreateRuleDto } from '../dto/create-rule.dto';

const DEFAULT_RULE_ID = 'suspicious_activity';

@Injectable()
export class RuleEvaluatorService implements OnModuleInit {
  constructor(
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
  ) {}

  async onModuleInit() {
    await this.createDefaultRuleIfNotExists();
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

  private async createDefaultRuleIfNotExists(): Promise<void> {
    // Check if the default rule already exists
    const defaultRule = await this.ruleRepository.findOne({ 
      where: { name: DEFAULT_RULE_ID } 
    });
    
    // If the default rule doesn't exist, create it
    if (!defaultRule) {
      const rule = new Rule();
      rule.name = DEFAULT_RULE_ID;
      await this.ruleRepository.save(rule);
      console.log(`Created default rule: ${DEFAULT_RULE_ID}`);
    } else {
      console.log(`Default rule already exists: ${DEFAULT_RULE_ID}`);
    }
  }
}
