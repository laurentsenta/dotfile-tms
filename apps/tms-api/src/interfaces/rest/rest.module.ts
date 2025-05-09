import { Module } from '@nestjs/common';
import { AlertAggregateService } from '../../data/alert-aggregate.service';
import { RiskAccountsService } from '../../data/risk-accounts.service';
import { MessageQueueModule } from '../../storage/mq.module';
import { RedisModule } from '../../storage/redis.module';
import { RulesEvaluationWorkerModule } from '../../worker/rule-evaluator.module';
import { AlertsController } from './alerts.controller';
import { RestController } from './rest.controller';
import { RulesController } from './rules.controller';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [RedisModule, MessageQueueModule, RulesEvaluationWorkerModule],
  controllers: [
    RestController,
    TransactionsController,
    RulesController,
    AlertsController,
  ],
  providers: [RiskAccountsService, AlertAggregateService],
})
export class RestModule {}
