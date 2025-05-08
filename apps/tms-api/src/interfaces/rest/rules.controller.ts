import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RuleEvaluatorService } from '../../app/services/rule-evaluator.service';
import { Rule } from '@dotfile-tms/database';
import { CreateRuleDto } from '../dto/create-rule.dto';

@Controller('/v1/rules')
export class RulesController {
  constructor(private readonly ruleEvaluatorService: RuleEvaluatorService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  listAll(): Promise<Rule[]> {
    return this.ruleEvaluatorService.listAllRules();
  }

  @Get(':name')
  @HttpCode(HttpStatus.OK)
  getByName(@Param('name') name: string): Promise<Rule> {
    return this.ruleEvaluatorService.getRuleByName(name);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createRule(
    @Body() createRuleDto: CreateRuleDto
  ): Promise<Rule> {
    return this.ruleEvaluatorService.createRule(createRuleDto);
  }
}
