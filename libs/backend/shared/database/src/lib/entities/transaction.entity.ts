import { Entity, Column, Check } from 'typeorm';
import { BaseEntity } from './base-entity';

export enum TransactionTypeEnum {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  TRANSFER = 'TRANSFER',
}

@Entity()
@Check('amount > 0')
export class Transaction extends BaseEntity {
  @Column({ 
    name: 'external_id', 
    unique: true, 
    nullable: false,
    comment: 'Unique ID in the customer system, recommend using uuid'
  })
  externalId: string;

  @Column({ 
    type: 'timestamptz', 
    nullable: false,
    comment: 'Date of the transaction in customer system'
  })
  date: Date;

  @Column({ name: 'source_account_key', nullable: true })
  sourceAccountKey: string;

  @Column({ name: 'target_account_key', nullable: true })
  targetAccountKey: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  currency: string;

  @Column({
    type: 'enum',
    enum: TransactionTypeEnum,
    nullable: false
  })
  type: TransactionTypeEnum;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, unknown>;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date;
}
