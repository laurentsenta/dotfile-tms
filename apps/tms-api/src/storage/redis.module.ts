import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountHistoryRepository } from '../data/accounthistory.repository';
import { AccountHistoryRepositoryRedis } from '../data/accounthistory.repository.impl';
import { RiskAccountsRepository } from '../data/risk-accounts.repository';
import { RiskAccountsRepositoryStatic } from '../data/risk-accounts.repository.impl';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AccountHistoryRepository,
      useClass: AccountHistoryRepositoryRedis,
    },
    {
      provide: RiskAccountsRepository,
      useClass: RiskAccountsRepositoryStatic,
    },
  ],
  exports: [AccountHistoryRepository, RiskAccountsRepository],
})
export class RedisModule {}
