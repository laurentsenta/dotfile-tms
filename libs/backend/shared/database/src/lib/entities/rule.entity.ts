import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base-entity';
import { Alert } from './alert.entity';

@Entity()
export class Rule extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @OneToMany(() => Alert, (alert) => alert.rule)
  alerts: Alert[];
}
