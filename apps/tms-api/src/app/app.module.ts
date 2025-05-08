import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestController } from '../interfaces/rest/rest.controller';
import { TransactionsController } from '../interfaces/rest/transactions.controller';
import { RulesController } from '../interfaces/rest/rules.controller';
import { AlertsController } from '../interfaces/rest/alerts.controller';
import { AppService } from './app.service';
import { RuleEvaluatorService } from './services/rule-evaluator.service';
import { Transaction, Rule, Alert } from '@dotfile-tms/database';
import { GraphqlModule } from '../interfaces/graphql/graphql.module';
import { MessageQueueModule } from '../storage/mq.module';
import { RulesWorkerModule } from '../rules/rules-worker.module';
import { RedisModule } from '../storage/redis.module';
import { AccountHistoryRedisService } from '../data/accounthistory.service';
import { RiskAccountsService } from '../data/risk-accounts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Rule, Alert]),
    GraphqlModule,
    MessageQueueModule,
    RulesWorkerModule,
    RedisModule,
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
    RiskAccountsService
  ],
})
export class AppModule {}
