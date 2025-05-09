import { Module } from '@nestjs/common';

import {
  Alert,
  DatabaseModule,
  Rule,
  Transaction,
} from '@dotfile-tms/database';
import { migrations } from '@dotfile-tms/migrations';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RulesAggregateService } from '../data/rules-aggregate.service';
import { TransactionAggregateService } from '../data/transaction-aggregate.service';
import { RulesEvaluationWorkerModule } from '../worker/rule-evaluator.module';

// @NOTE migrations will run at this API startup
@Module({
  imports: [
    DatabaseModule.register({ migrations }),
    TypeOrmModule.forFeature([Transaction, Rule, Alert]),
    RulesEvaluationWorkerModule,
  ],
  providers: [TransactionAggregateService, RulesAggregateService],
  exports: [TransactionAggregateService, RulesAggregateService],
})
export class ApiDatabaseModule {}
