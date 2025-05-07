import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Rule } from './rule.entity';
import { Alert } from './alert.entity';

export const ENTITIES = [Transaction, Rule, Alert];

@Module({
  imports: [TypeOrmModule.forFeature(ENTITIES)],
})
export class EntitiesModule {}
