import { Module } from '@nestjs/common';
import { ApiDatabaseModule } from '../../storage/database.module';
import { RulesEvaluationWorkerModule } from '../../worker/rule-evaluator.module';
import { AlertsController } from './alerts.controller';
import { RestController } from './rest.controller';
import { RulesController } from './rules.controller';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [ApiDatabaseModule, RulesEvaluationWorkerModule],
  controllers: [
    RestController,
    TransactionsController,
    RulesController,
    AlertsController,
  ],
  providers: [],
})
export class RestModule {}
