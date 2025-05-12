import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { Rule } from './rule.entity';
import { Transaction } from './transaction.entity';

export enum AlertStatusEnum {
  NEW = 'NEW',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

@Entity()
export class Alert extends BaseEntity {
  @ManyToOne(() => Rule, (rule) => rule.alerts, { nullable: false })
  @JoinColumn({ name: 'rule_id' })
  rule: Rule;

  @ManyToOne(() => Transaction, (transaction) => transaction.alerts, {
    nullable: false,
  })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({
    type: 'enum',
    enum: AlertStatusEnum,
    default: AlertStatusEnum.NEW,
    nullable: false,
  })
  status: AlertStatusEnum;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, unknown>;
}
