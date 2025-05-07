import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RuleEvaluatorService } from './services/rule-evaluator.service';
import { Transaction, Rule, Alert } from '@dotfile-tms/database';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateRuleDto } from './dto/create-rule.dto';

@Controller('/v1/health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getMessage() {
    return { message: 'OK' };
  }
}

@Controller('/v1/transactions')
export class TransactionsController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  listAll(): Promise<Transaction[]> {
    return this.appService.listAllTransactions();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTransaction(
    @Body() createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    return this.appService.createTransaction(createTransactionDto);
  }
}

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

@Controller('/v1/alerts')
export class AlertsController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  listAll(): Promise<Alert[]> {
    return this.appService.listAllAlerts();
  }

  @Get('transaction/:id')
  @HttpCode(HttpStatus.OK)
  getByTransactionId(@Param('id') id: string): Promise<Alert[]> {
    return this.appService.getAlertsByTransactionId(id);
  }
}
