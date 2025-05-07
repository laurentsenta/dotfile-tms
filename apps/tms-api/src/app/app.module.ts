import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AppController,
  TransactionsController,
  RulesController,
  AlertsController,
} from './app.controller';
import { AppService } from './app.service';
import { RuleEvaluatorService } from './services/rule-evaluator.service';
import { Transaction, Rule, Alert } from '@dotfile-tms/database';
import { GraphqlModule } from './graphql/graphql.module';
import { MessageQueueModule } from '../database/mq.module';
import { RulesWorkerModule } from '../rules/rules-worker.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Rule, Alert]),
    GraphqlModule,
    MessageQueueModule,
    RulesWorkerModule,
  ],
  controllers: [
    AppController,
    TransactionsController,
    RulesController,
    AlertsController,
  ],
  providers: [AppService, RuleEvaluatorService],
})
export class AppModule {}
