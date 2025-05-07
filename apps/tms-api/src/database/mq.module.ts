import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    // TODO: use env variables
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
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
