import axios from 'axios';

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations: Array<{ line: number; column: number }>;
    path: string[];
  }>;
}

interface TransactionData {
  id: string;
  externalId: string;
  date: string;
  sourceAccountKey: string;
  targetAccountKey: string;
  amount: number;
  currency: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  processedAt: string;
  alerts: AlertData[];
}

interface RuleData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface AlertData {
  id: string;
  rule: RuleData;
  transaction?: {
    id: string;
    externalId: string;
  };
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

const CENTS = 100;

describe('GraphQL API', () => {
  // Helper function to execute GraphQL queries
  async function executeGraphQLQuery<T>(query: string, variables?: Record<string, unknown>): Promise<GraphQLResponse<T>> {
    const response = await axios.post('/graphql', {
      query,
      variables,
    });
    return response.data;
  }

  // TODO: type our endpoints correctly
  let normalTx: any;
  let suspiciousTx: any;

  // Create test transactions
  async function createTestTransactions() {
    // Create a normal transaction
    const normalTx = {
      externalId: 'graphql-test-normal',
      date: new Date().toISOString(),
      sourceAccountKey: 'source_account',
      targetAccountKey: 'target_account',
      amount: 100 * CENTS,
      currency: 'USD',
      type: 'TRANSFER',
    };

    // Create a suspicious transaction (high amount)
    const suspiciousTx = {
      externalId: 'graphql-test-suspicious',
      date: new Date().toISOString(),
      sourceAccountKey: 'source_account',
      targetAccountKey: 'target_account',
      amount: 15000 * CENTS,
      currency: 'USD',
      type: 'TRANSFER',
    };

    // Create the transactions using the REST API
    const normalTxRes = await axios.post('/api/v1/transactions', normalTx);
    const suspiciousTxRes = await axios.post('/api/v1/transactions', suspiciousTx);

    return {
      normalTx: normalTxRes.data,
      suspiciousTx: suspiciousTxRes.data,
    };
  }

  beforeAll(async () => {
    const txs = await createTestTransactions();
    normalTx = txs.normalTx;
    suspiciousTx = txs.suspiciousTx;
  });
    

  it('should query all transactions', async () => {
    // Query all transactions
    const query = `
      query {
        transactions {
          id
          externalId
          amount
          currency
          type
          processedAt
        }
      }
    `;

    const response = await executeGraphQLQuery<{ transactions: TransactionData[] }>(query);

    // Verify the response
    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data.transactions).toBeInstanceOf(Array);
    
    // Find our test transactions in the results
    const foundNormalTx = response.data.transactions.find(tx => tx.id === normalTx.id);
    const foundSuspiciousTx = response.data.transactions.find(tx => tx.id === suspiciousTx.id);

    // Verify the normal transaction
    expect(foundNormalTx).toBeDefined();
    expect(foundNormalTx?.externalId).toBe('graphql-test-normal');
    expect(foundNormalTx?.amount).toBe(100 * CENTS);
    expect(foundNormalTx?.currency).toBe('USD');
    expect(foundNormalTx?.type).toBe('TRANSFER');
    expect(foundNormalTx?.processedAt).toBeDefined();

    // Verify the suspicious transaction
    expect(foundSuspiciousTx).toBeDefined();
    expect(foundSuspiciousTx?.externalId).toBe('graphql-test-suspicious');
    expect(foundSuspiciousTx?.amount).toBe(15000 * CENTS);
    expect(foundSuspiciousTx?.currency).toBe('USD');
    expect(foundSuspiciousTx?.type).toBe('TRANSFER');
    expect(foundSuspiciousTx?.processedAt).toBeDefined();
  });

  it('should query a single transaction with its alerts', async () => {
    // Query a single transaction with its alerts
    const query = `
      query($id: ID!) {
        transaction(id: $id) {
          id
          externalId
          amount
          currency
          type
          processedAt
          alerts {
            id
            status
            rule {
              name
            }
          }
        }
      }
    `;

    const variables = { id: suspiciousTx.id };
    const response = await executeGraphQLQuery<{ transaction: TransactionData }>(query, variables);

    // Verify the response
    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data.transaction).toBeDefined();
    expect(response.data.transaction.id).toBe(suspiciousTx.id);
    expect(response.data.transaction.externalId).toBe('graphql-test-suspicious');
    expect(response.data.transaction.amount).toBe(15000 * CENTS);
    expect(response.data.transaction.alerts).toBeInstanceOf(Array);
    expect(response.data.transaction.alerts.length).toBeGreaterThan(0);
    
    // Verify the alert
    const alert = response.data.transaction.alerts[0];
    expect(alert.status).toBe('NEW');
    expect(alert.rule.name).toBe('suspicious_activity');
  });

  it('should query alerts by transaction ID', async () => {
    // Query alerts by transaction ID
    const query = `
      query($transactionId: ID!) {
        alertsByTransaction(transactionId: $transactionId) {
          id
          status
          rule {
            name
          }
          transaction {
            id
            externalId
          }
        }
      }
    `;

    const variables = { transactionId: suspiciousTx.id };
    const response = await executeGraphQLQuery<{ alertsByTransaction: AlertData[] }>(query, variables);

    // Verify the response
    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data.alertsByTransaction).toBeInstanceOf(Array);
    expect(response.data.alertsByTransaction.length).toBeGreaterThan(0);
    
    // Verify the alert
    const alert = response.data.alertsByTransaction[0];
    expect(alert.status).toBe('NEW');
    expect(alert.rule.name).toBe('suspicious_activity');
    expect(alert.transaction.id).toBe(suspiciousTx.id);
    expect(alert.transaction.externalId).toBe('graphql-test-suspicious');
  });

  it('should create a transaction using GraphQL mutation', async () => {
    // Create a transaction using GraphQL mutation
    const mutation = `
      mutation($input: CreateTransactionInput!) {
        createTransaction(input: $input) {
          id
          externalId
          date
          sourceAccountKey
          targetAccountKey
          amount
          currency
          type
          processedAt
        }
      }
    `;

    const variables = {
      input: {
        externalId: 'graphql-mutation-test',
        date: new Date().toISOString(),
        sourceAccountKey: 'source_account',
        targetAccountKey: 'target_account',
        amount: 200 * CENTS,
        currency: 'USD',
        type: 'TRANSFER'
      }
    };

    const response = await executeGraphQLQuery<{ createTransaction: TransactionData }>(mutation, variables);

    // Verify the response
    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data.createTransaction).toBeDefined();
    expect(response.data.createTransaction.id).toBeDefined();
    expect(response.data.createTransaction.externalId).toBe('graphql-mutation-test');
    expect(response.data.createTransaction.amount).toBe(200 * CENTS);
    expect(response.data.createTransaction.currency).toBe('USD');
    expect(response.data.createTransaction.type).toBe('TRANSFER');
    expect(response.data.createTransaction.processedAt).toBeDefined();
  });
});
