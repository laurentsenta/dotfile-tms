import { Alert, Rule, Transaction } from '@dotfile-tms/database';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from '../app.service';
import { RuleEvaluatorService } from '../services/rule-evaluator.service';
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
  ],
  providers: [
    TransactionResolver,
    AlertResolver,
    AppService,
    RuleEvaluatorService,
  ],
})
export class GraphqlModule {}
