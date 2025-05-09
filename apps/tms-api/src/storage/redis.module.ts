import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountHistory } from '../data/accounthistory.entity';
import { AccountHistoryRedisService } from '../data/accounthistory.service';
import { RiskAccounts } from '../data/risk-accounts.entity';
import { RiskAccountsService } from '../data/risk-accounts.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AccountHistory,
      useClass: AccountHistoryRedisService,
    },
    {
      provide: RiskAccounts,
      useClass: RiskAccountsService,
    },
  ],
  exports: [AccountHistory, RiskAccounts],
})
export class RedisModule {}
