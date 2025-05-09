import { Module } from '@nestjs/common';

import {
  Alert,
  DatabaseModule,
  Rule,
  Transaction,
} from '@dotfile-tms/database';
import { migrations } from '@dotfile-tms/migrations';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertAggregateService } from '../data/alert-aggregate.service';
import { RulesAggregateService } from '../data/rules-aggregate.service';
import { TransactionAggregateService } from '../data/transaction-aggregate.service';

// @NOTE migrations will run at this API startup
@Module({
  imports: [
    DatabaseModule.register({ migrations }),
    TypeOrmModule.forFeature([Transaction, Rule, Alert]),
  ],
  providers: [
    TransactionAggregateService,
    RulesAggregateService,
    AlertAggregateService,
  ],
  exports: [
    TransactionAggregateService,
    RulesAggregateService,
    AlertAggregateService,
  ],
})
export class ApiDatabaseModule {}
