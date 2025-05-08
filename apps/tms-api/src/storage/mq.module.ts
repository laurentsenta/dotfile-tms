import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

const REDIS_HOST = 'localhost'; // TODO: use env variables
const REDIS_PORT = 6379; // TODO: use env variables

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    }),
    BullModule.registerQueue({
      name: 'transactions',
    }),
    BullModule.registerQueue({
      name: 'alerts',
    }),
  ],
  exports: [
    BullModule.registerQueue({
      name: 'transactions',
    }),
    BullModule.registerQueue({
      name: 'alerts',
    }),
  ],
})
export class MessageQueueModule {}
