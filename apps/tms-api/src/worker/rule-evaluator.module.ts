import { Module } from '@nestjs/common';
import { ApiDatabaseModule } from '../storage/database.module';
import { MessageQueueModule } from '../storage/mq.module';
import { RuleEvaluatorService } from './rule-evaluator.service';
import {
  EvalRulesConsumer,
  TransactionQueueService,
} from './transaction-queue.service';
import { RedisModule } from '../storage/redis.module';

// Later: split this into a separate app that we can scale horizontally
// worker & api will need to share the TransactionQueueService only.
@Module({
  imports: [ApiDatabaseModule, MessageQueueModule, RedisModule],
  providers: [RuleEvaluatorService, EvalRulesConsumer, TransactionQueueService],
  exports: [TransactionQueueService],
})
export class RulesEvaluationWorkerModule {}
