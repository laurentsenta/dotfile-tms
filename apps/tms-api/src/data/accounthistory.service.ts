import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AccountHistory } from './accounthistory.entity';

const REDIS_HOST = 'localhost'; // TODO: use env variables
const REDIS_PORT = 6379; // TODO: use env variables

export class AccountHistoryRedisService
  implements OnModuleDestroy, AccountHistory
{
  private readonly redisClient: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redisClient = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
    });
  }

  async incDailyTx(
    account: string,
    day: string,
    amount: number
  ): Promise<number> {
    try {
      const key = `account:history:daily:${account}:${day}`;
      const newTotal = await this.redisClient.incrby(key, amount);
      await this.redisClient.expire(key, 60 * 60 * 24 * 30);

      return newTotal;
    } catch (error) {
      throw new Error(
        `Failed to increment daily transaction: ${error.message}`
      );
    }
  }

  async getDailyTxTotal(account: string, day: string): Promise<number> {
    try {
      const key = `account:history:daily:${account}:${day}`;
      const value = await this.redisClient.get(key);
      return value ? parseFloat(value) : 0;
    } catch (error) {
      throw new Error(`Failed to get daily transaction: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
