import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';

interface TransactionReference {
  id: string;
}

@Injectable()
export class TransactionQueueService {
  constructor(
    @InjectQueue('transactions')
    private readonly queue: Queue
  ) {}

  notifyTransactionCreated(transaction: TransactionReference): void {
    this.queue.add('eval-rules', transaction, {
      jobId: transaction.id,
      removeOnComplete: true,
    });
  }
}

@Processor('transactions')
export class EvalRulesConsumer extends WorkerHost {
  async process(job: Job<TransactionReference>) {
    if (job.name == 'eval-rules') {
      console.log('Processing job:', job.id, 'with data:', job.data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Finished processing job:', job.id);
      return {};
    }
  }
}
