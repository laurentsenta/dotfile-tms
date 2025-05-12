import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { RulesAggregate } from '../../data/rules.aggregate';
import { RuleType } from '../dto/rule.type';

@Controller('/v1/rules')
export class RulesController {
  constructor(private readonly ruleEvaluatorService: RulesAggregate) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  listAll(): Promise<RuleType[]> {
    return this.ruleEvaluatorService.listAllRules();
  }

  @Get(':name')
  @HttpCode(HttpStatus.OK)
  getByName(@Param('name') name: string): Promise<RuleType> {
    return this.ruleEvaluatorService.getRuleByName(name);
  }
}
