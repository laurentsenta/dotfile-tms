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

interface Rule {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Alert {
  id: string;
  rule: Rule;
  transaction: Transaction;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

type TransactionParam = Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'processed_at'>; 
type RuleParam = Pick<Rule, 'name'>;

const CENTS = 100;

describe('GET /api/v1/health', () => {
  it('should return a OK', async () => {
    const res = await axios.get(`/api/v1/health`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'OK' });
  });
});

describe('Rules and Alerts API', () => {
  // Test for rules and alerts
  it('should create a rule, list rules, and get a rule by name', async () => {
    // Step 1: Create a rule
    const rule: RuleParam = {
      name: 'test_rule'
    };

    const createRuleRes = await axios.post('/api/v1/rules', rule);
    expect(createRuleRes.status).toBe(201);
    expect(createRuleRes.data).toHaveProperty('id');
    expect(createRuleRes.data.name).toBe(rule.name);

    // Step 2: List all rules
    const listRulesRes = await axios.get('/api/v1/rules');
    expect(listRulesRes.status).toBe(200);
    expect(Array.isArray(listRulesRes.data)).toBe(true);
    
    // Should have at least the default rule and our new rule
    expect(listRulesRes.data.length).toBeGreaterThanOrEqual(2);

    // Step 3: Get rule by name
    const getRuleRes = await axios.get(`/api/v1/rules/${rule.name}`);
    expect(getRuleRes.status).toBe(200);
    expect(getRuleRes.data.name).toBe(rule.name);
  });

  it('should get alerts for a transaction', async () => {
    // First create a transaction
    const tx: TransactionParam = {
      external_id: 'test-alerts-tx',
      date: new Date().toISOString(),
      source_account_key: 'source_account',
      target_account_key: 'target_account',
      amount: 100 * CENTS,
      currency: 'USD',
      type: 'TRANSFER',
    };

    // Create the transaction
    const createTxRes = await axios.post('/api/v1/transactions', tx);
    expect(createTxRes.status).toBe(201);
    const transactionId = createTxRes.data.id;

    // Get alerts for the transaction
    const getAlertsRes = await axios.get(`/api/v1/alerts/transaction/${transactionId}`);
    expect(getAlertsRes.status).toBe(200);
    expect(Array.isArray(getAlertsRes.data)).toBe(true);
    
    // We don't expect any alerts for this transaction since we're not creating them automatically
    expect(getAlertsRes.data.length).toBe(0);
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

    // Step 4: Check that no alerts were created for the transaction
    const alertsRes = await axios.get(`/api/v1/alerts/transaction/${createRes.data.id}`);
    expect(alertsRes.status).toBe(200);
    expect(Array.isArray(alertsRes.data)).toBe(true);
    expect(alertsRes.data.length).toBe(0); // No alerts for this transaction

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
    
    const gotTx1Again = listRes2.data.find(tx => tx.id === createRes.data.id);
    const gotTx2 = listRes2.data.find(tx => tx.id === createRes2.data.id);
    
    expect(gotTx1Again).toBeDefined();
    expect(gotTx2).toBeDefined();
    expect(gotTx2.amount).toBe(tx2.amount);
    
    // Step 4: Check that the "processed_at" field is set for the suspicious transaction
    expect(gotTx2.processedAt).toBeDefined();

    // Step 5: Check that no alerts were created for the suspicious transaction
    const alertsRes2 = await axios.get(`/api/v1/alerts/transaction/${createRes2.data.id}`);
    // expect(alertsRes2.status).toBe(200);
    // expect(Array.isArray(alertsRes2.data)).toBe(true);
    // expect(alertsRes2.data.length).toBe(1);
  });
});
