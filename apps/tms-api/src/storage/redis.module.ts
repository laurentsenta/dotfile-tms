import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountHistoryRepository } from '../data/accounthistory.repository';
import { AccountHistoryRepositoryRedis } from '../data/accounthistory.repository.impl';
import { RiskAccounts } from '../data/risk-accounts.entity';
import { RiskAccountsService } from '../data/risk-accounts.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AccountHistoryRepository,
      useClass: AccountHistoryRepositoryRedis,
    },
    {
      provide: RiskAccounts,
      useClass: RiskAccountsService,
    },
  ],
  exports: [AccountHistoryRepository, RiskAccounts],
})
export class RedisModule {}
