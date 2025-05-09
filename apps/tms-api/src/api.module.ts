import { Module } from '@nestjs/common';
import { GraphqlModule } from './interfaces/graphql/graphql.module';
import { RestModule } from './interfaces/rest/rest.module';
import { ApiDatabaseModule } from './storage/database.module';
import { RulesEvaluationWorkerModule } from './worker/rule-evaluator.module';

@Module({
  imports: [
    ApiDatabaseModule,
    RestModule,
    GraphqlModule,
    RulesEvaluationWorkerModule,
  ],
})
export class ApiModule {}
