import { Module } from '@nestjs/common';
import { AlertAggregateService } from '../data/alert-aggregate.service';
import { ApiDatabaseModule } from '../storage/database.module';
import { MessageQueueModule } from '../storage/mq.module';
import { RuleEvaluatorService } from './rule-evaluator.service';
import {
  EvalRulesConsumer,
  TransactionQueueService,
} from './transaction-queue.service';

// Later: split this into a separate app that we can scale horizontally
@Module({
  imports: [ApiDatabaseModule, MessageQueueModule],
  providers: [AlertAggregateService, RuleEvaluatorService, EvalRulesConsumer, TransactionQueueService],
  exports: [TransactionQueueService],
})
export class RulesEvaluationWorkerModule {}
