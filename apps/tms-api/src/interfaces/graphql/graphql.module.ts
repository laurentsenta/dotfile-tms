import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApiDatabaseModule } from '../../storage/database.module';
import { RulesEvaluationWorkerModule } from '../../worker/rule-evaluator.module';
import { AlertResolver } from './alert.resolver';
import { TransactionResolver } from './transaction.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // TODO: re-use join(process.cwd(), 'apps/tms-api/src/schema.gql'), but need to fix the infinite loop when generating schema
      sortSchema: true,
    }),
    ApiDatabaseModule,
    RulesEvaluationWorkerModule,
  ],
  providers: [TransactionResolver, AlertResolver],
})
export class GraphqlModule {}
