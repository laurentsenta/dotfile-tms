import { Transaction } from '@dotfile-tms/database';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { RuleEvaluatorService } from './rule-evaluator.service';

interface TransactionReference {
  id: string;
}

@Injectable()
export class TransactionQueueService {
  constructor(
    private readonly evaluator: RuleEvaluatorService
  ) {}

  async notifyTransactionCreated(transaction: Transaction) {
    // Later: switch to an async mode, use the message queue to notify
    // workers to process the transaction.
    // You could even return a second async structure (promise, or observable)
    // that resolves once the transaction is fully processed if the user requests a
    // "blocking" ingestion.

    // this.queue.add('eval-rules', transaction, {
    //   jobId: transaction.id,
    //   removeOnComplete: true,
    // });

    return this.evaluator.inspect(transaction);
  }
}

@Processor('transactions')
export class EvalRulesConsumer extends WorkerHost {
  async process(job: Job<TransactionReference>) {
    if (job.name == 'eval-rules') {
      // Later: Run the evaluator here.
      return {};
    }
  }
}
