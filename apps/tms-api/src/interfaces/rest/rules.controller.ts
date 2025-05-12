import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { RulesAggregateService } from '../../data/rules-aggregate.service';
import { RuleType } from '../dto/rule.type';

@Controller('/v1/rules')
export class RulesController {
  constructor(private readonly ruleEvaluatorService: RulesAggregateService) {}

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
