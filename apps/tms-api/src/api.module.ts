import { Module } from '@nestjs/common';
import { ApiDatabaseModule } from './database/database.module';
import { RulesWorkerModule } from './rules/rules-worker.module';
import { RestModule } from './interfaces/rest/rest.module';
import { GraphqlModule } from './interfaces/graphql/graphql.module';

@Module({
  imports: [
    ApiDatabaseModule,
    RestModule,
    GraphqlModule,
    RulesWorkerModule,
  ],
})
export class ApiModule {}
