import { Module } from '@nestjs/common';
import { MessageQueueModule } from '../database/mq.module';
import {
  EvalRulesConsumer,
  TransactionQueueService,
} from './transaction-queue.service';

@Module({
  imports: [MessageQueueModule],
  providers: [EvalRulesConsumer, TransactionQueueService],
  exports: [TransactionQueueService],
})
export class RulesWorkerModule {}
