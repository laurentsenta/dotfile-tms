import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountHistoryRedisService } from '../data/accounthistory.service';

@Module({
  imports: [ConfigModule],
  providers: [AccountHistoryRedisService],
  exports: [AccountHistoryRedisService],
})
export class RedisModule {}
