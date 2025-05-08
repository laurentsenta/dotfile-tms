import { Module } from '@nestjs/common';
import { RestController } from './rest.controller';
import { TransactionsController } from './transactions.controller';
import { RulesController } from './rules.controller';
import { AlertsController } from './alerts.controller';
import { AppService } from '../../app/app.service';
import { RuleEvaluatorService } from '../../app/services/rule-evaluator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction, Rule, Alert } from '@dotfile-tms/database';
import { RedisModule } from '../../database/redis.module';
import { AccountHistoryRedisService } from '../../data/accounthistory.service';
import { RiskAccountsService } from '../../data/risk-accounts.service';
import { MessageQueueModule } from '../../database/mq.module';
import { RulesWorkerModule } from '../../rules/rules-worker.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Rule, Alert]),
    RedisModule,
    MessageQueueModule,
    RulesWorkerModule,
  ],
  controllers: [
    RestController,
    TransactionsController,
    RulesController,
    AlertsController,
  ],
  providers: [
    AppService,
    RuleEvaluatorService,
    AccountHistoryRedisService,
    RiskAccountsService,
  ],
  exports: [
    AppService,
    RuleEvaluatorService,
  ],
})
export class RestModule {}
