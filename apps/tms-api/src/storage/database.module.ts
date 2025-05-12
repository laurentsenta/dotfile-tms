import { Module } from '@nestjs/common';

import {
  Alert,
  DatabaseModule,
  Rule,
  Transaction,
} from '@dotfile-tms/database';
import { migrations } from '@dotfile-tms/migrations';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertAggregate } from '../data/alert.aggregate';
import { RulesAggregateService } from '../data/rules-aggregate.service';
import { TransactionAggregate } from '../data/transaction.aggregate';

// @NOTE migrations will run at this API startup
@Module({
  imports: [
    DatabaseModule.register({ migrations }),
    TypeOrmModule.forFeature([Transaction, Rule, Alert]),
  ],
  providers: [
    TransactionAggregate,
    RulesAggregateService,
    AlertAggregate,
  ],
  exports: [
    TransactionAggregate,
    RulesAggregateService,
    AlertAggregate,
  ],
})
export class ApiDatabaseModule {}
