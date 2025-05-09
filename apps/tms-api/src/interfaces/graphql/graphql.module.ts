import { Alert, Rule, Transaction } from '@dotfile-tms/database';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertAggregateService } from '../../data/alert-aggregate.service';
import { RiskAccountsService } from '../../data/risk-accounts.service';
import { RulesAggregateService } from '../../data/rules-aggregate.service';
import { RulesEvaluationWorkerModule } from '../../worker/rule-evaluator.module';
import { AlertResolver } from './resolvers/alert.resolver';
import { TransactionResolver } from './resolvers/transaction.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // TODO: re-use join(process.cwd(), 'apps/tms-api/src/schema.gql'), but need to fix the infinite loop when generating schema
      sortSchema: true,
    }),
    TypeOrmModule.forFeature([Transaction, Rule, Alert]),
    RulesEvaluationWorkerModule,
  ],
  providers: [
    TransactionResolver,
    AlertResolver,
    AlertAggregateService,
    RulesAggregateService,
    RiskAccountsService,
  ],
})
export class GraphqlModule {}
