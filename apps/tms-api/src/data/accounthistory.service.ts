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

  /**
   * Converts a date to a bucketed time window
   * @param date The date to bucket
   * @param windowMinutes The time window in minutes
   * @returns Bucketed timestamp (minutes since epoch, rounded to window)
   */
  private getBucketedTimestamp(date: Date, windowMinutes: number): number {
    const minutesSinceEpoch = Math.floor(date.getTime() / (60 * 1000));
    return Math.floor(minutesSinceEpoch / windowMinutes) * windowMinutes;
  }

  async incTxCount(
    account: string,
    date: Date,
    windowMinutes: number
  ): Promise<number> {
    try {
      const bucketedTimestamp = this.getBucketedTimestamp(date, windowMinutes);
      const key = `account:history:velocity:${account}:${bucketedTimestamp}`;
      const newCount = await this.redisClient.incr(key);
      
      // TODO: optimize this by computing an expiration time based on the window.
      await this.redisClient.expire(key, 60 * 60 * 1);

      return newCount;
    } catch (error) {
      throw new Error(
        `Failed to increment transaction count: ${error.message}`
      );
    }
  }

  async getTxCount(
    account: string,
    date: Date,
    windowMinutes: number
  ): Promise<number> {
    try {
      const bucketedTimestamp = this.getBucketedTimestamp(date, windowMinutes);
      const key = `account:history:velocity:${account}:${bucketedTimestamp}`;
      const value = await this.redisClient.get(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      throw new Error(`Failed to get transaction count: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
