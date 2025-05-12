import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AccountHistoryRepositoryRedis } from './accounthistory.repository.impl';
import { addDays, toDate } from 'date-fns';

let accountId = 0;
const getAccount = (prefix = 'account'): string => {
  return `${prefix}-${++accountId}`;
};

let day = 0;
const getDay = (str: string = undefined): Date => {
  if (str) {
    // return date from given day, using date fns:
    return toDate(str);
  }

  return addDays(new Date('2025-08-01'), day++);
};

describe('AccountHistoryRedisService', () => {
  let service: AccountHistoryRepositoryRedis;
  let redis: Redis;
  const keyPrefix = `test:${new Date().toISOString().replace(/[:.]/g, '-')}:`;

  // Mock ConfigService
  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'REDIS_HOST') return 'localhost';
      if (key === 'REDIS_PORT') return 6379;
      return null;
    }),
  };

  beforeAll(async () => {
    // Create a Redis client with the test key prefix
    redis = new Redis({
      host: 'localhost',
      port: 6379,
      keyPrefix,
    });

    // Create a custom provider for the test
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountHistoryRepositoryRedis,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AccountHistoryRepositoryRedis>(
      AccountHistoryRepositoryRedis
    );

    // Override the service's Redis client with our prefixed one
    Object.defineProperty(service, 'redisClient', {
      value: redis,
      writable: true,
    });
  });

  afterAll(async () => {
    // Clean up all keys created during the test
    const keys = await redis.keys('*');
    if (keys.length > 0) {
      await redis.del(keys);
    }

    // Close Redis connections
    // await redis.quit();
    await service.onModuleDestroy();
  });

  beforeEach(async () => {
    // Clean up before each test
    const keys = await redis.keys('*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('incDailyTx', () => {
    it('should increment daily transaction amount and return the new total', async () => {
      const account = getAccount();
      const day = getDay();

      // First increment
      const total1 = await service.incDailyTx(account, day, 100);
      expect(total1).toBe(100);

      // Second increment
      const total2 = await service.incDailyTx(account, day, 50);
      expect(total2).toBe(150);

      // check the total value
      const result = await service.getDailyTxTotal(account, day);
      expect(result).toBe(150);
    });

    it('should handle multiple accounts independently', async () => {
      const account1 = getAccount('account-1');
      const account2 = getAccount('account-2');
      const day = getDay();

      await service.incDailyTx(account1, day, 100);
      await service.incDailyTx(account2, day, 200);

      const total1 = await service.getDailyTxTotal(account1, day);
      const total2 = await service.getDailyTxTotal(account2, day);

      expect(total1).toBe(100);
      expect(total2).toBe(200);
    });

    it('should handle errors gracefully', async () => {
      // Mock a Redis error
      jest.spyOn(redis, 'incrby').mockImplementationOnce(() => {
        return Promise.reject(new Error('Redis connection error'));
      });

      await expect(
        service.incDailyTx(getAccount(), getDay(), 100)
      ).rejects.toThrow(
        'Failed to increment daily transaction: Redis connection error'
      );
    });
  });

  describe('getDailyTxTotal', () => {
    it('should return the correct daily total', async () => {
      const account = getAccount();
      const day = getDay();

      await service.incDailyTx(account, day, 150);

      const total = await service.getDailyTxTotal(account, day);
      expect(total).toBe(150);
    });

    it('should return 0 for non-existent keys', async () => {
      const total = await service.getDailyTxTotal(
        'non-existent',
        getDay('2025-08-01')
      );
      expect(total).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      // Mock a Redis error
      jest.spyOn(redis, 'get').mockImplementationOnce(() => {
        return Promise.reject(new Error('Redis connection error'));
      });

      await expect(
        service.getDailyTxTotal(getAccount(), getDay())
      ).rejects.toThrow(
        'Failed to get daily transaction: Redis connection error'
      );
    });
  });
});
