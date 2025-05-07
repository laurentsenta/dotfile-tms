import axios from 'axios';

interface Transaction {
  id: string;
  external_id: string;
  date: string;
  source_account_key: string;
  target_account_key: string;
  amount: number;
  currency: string;
  type: string;
  // metadata
  created_at: string;
  updated_at: string;
  processed_at: string;
}

type TransactionParam = Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'processed_at'>; 

const CENTS = 100;

describe('GET /api/v1/health', () => {
  it('should return a OK', async () => {
    const res = await axios.get(`/api/v1/health`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'OK' });
  });
});

describe('Transaction API', () => {
  // Clear transactions before each test
  beforeEach(async () => {
    // Note: In a real implementation, we would clear the database here
  });

  it('should create a transaction, list it, and verify its properties', async () => {
    const tx1: TransactionParam = {
      external_id: '12345',
      date: new Date().toISOString(),
      source_account_key: 'source_account',
      target_account_key: 'target_account',
      amount: 100 * CENTS,
      currency: 'USD',
      type: 'TRANSFER',
    };

    // Step 1: Add one transaction
    const createRes = await axios.post('/api/v1/transactions', tx1);
    expect(createRes.status).toBe(201);
    expect(createRes.data).toHaveProperty('id');
    expect(createRes.data.amount).toBe(tx1.amount);

    // Step 2: List all transactions
    const listRes = await axios.get('/api/v1/transactions');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.data)).toBe(true);

    // Step 3: Check that we retrieved the transaction
    const gotTx1 = listRes.data.find(tx => tx.id === createRes.data.id);

    expect(gotTx1).toBeDefined();
    expect(gotTx1.amount).toBe(tx1.amount);
    expect(gotTx1.processedAt).toBeDefined();

    // Create a duplicate transaction (same external_id)
    try {
      await axios.post('/api/v1/transactions', tx1);
      fail('Expected a 409 error but no error was thrown');
    } catch (error) {
      expect(error.response.status).toBe(409);
      expect(error.response.data.message).toContain(`Transaction with external_id '${tx1.external_id}' already exists`);
    }


    // Create a suspicious transaction (high amount)
    const tx2: TransactionParam = { 
      ...tx1, 
      external_id: '67890', 
      amount: 15000 * CENTS,
      type: 'TRANSFER'
    };

    // Step 1: Add the suspicious transaction
    const createRes2 = await axios.post('/api/v1/transactions', tx2);
    expect(createRes2.status).toBe(201);
    expect(createRes2.data).toHaveProperty('id');
    expect(createRes2.data.amount).toBe(tx2.amount);

    // Step 2: List all transactions again
    const listRes2 = await axios.get('/api/v1/transactions');
    expect(listRes2.status).toBe(200);
    expect(Array.isArray(listRes2.data)).toBe(true);
    expect(listRes2.data.length).toBe(2); // Should now have 2 transactions

    // Step 3: Check that we retrieved both transactions
    const gotTx1Again = listRes2.data.find(tx => tx.id === createRes.data.id);
    const gotTx2 = listRes2.data.find(tx => tx.id === createRes2.data.id);
    
    expect(gotTx1Again).toBeDefined();
    expect(gotTx2).toBeDefined();
    expect(gotTx2.amount).toBe(tx2.amount);
    
    // Step 4: Check that the "processed_at" field is set for the suspicious transaction
    expect(gotTx2.processedAt).toBeDefined();
  });
});
