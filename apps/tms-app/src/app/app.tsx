import styled from 'styled-components';
import { useQuery, gql } from '@apollo/client';

// Define types for our data
interface Rule {
  id: string;
  name: string;
}

interface Alert {
  id: string;
  status: string;
  rule: Rule;
}

interface Transaction {
  id: string;
  externalId: string;
  date: string;
  amount: number;
  currency: string;
  type: string;
  sourceAccountKey?: string;
  targetAccountKey?: string;
  processedAt?: string;
  alerts?: Alert[];
}

const StyledApp = styled.div`
  font-family: sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const StyledHeader = styled.header`
  margin-bottom: 20px;
  
  h1 {
    color: #333;
  }
`;

const StyledList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const StyledListItem = styled.li`
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StyledAlertList = styled.ul`
  list-style-type: none;
  padding: 10px 0 0 20px;
`;

const StyledAlertItem = styled.li`
  background-color: #fff;
  border-left: 3px solid #ff9800;
  padding: 10px;
  margin-bottom: 5px;
  font-size: 0.9em;
`;

// GraphQL query to fetch transactions
const GET_TRANSACTIONS = gql`
  query GetTransactions {
    transactions {
      id
      externalId
      date
      amount
      currency
      type
      sourceAccountKey
      targetAccountKey
      processedAt
      alerts {
        id
        status
        rule {
          id
          name
        }
      }
    }
  }
`;

export function App() {
  // Execute the query
  const { loading, error, data } = useQuery(GET_TRANSACTIONS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <StyledApp>
      <StyledHeader>
        <h1>Transaction Monitoring System</h1>
        <p>Displaying a list of transactions and their alerts</p>
      </StyledHeader>

      <h2>Transactions</h2>
      {data?.transactions?.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <StyledList>
          {data?.transactions?.map((transaction: Transaction) => (
            <StyledListItem key={transaction.id}>
              <h3>Transaction ID: {transaction.id}</h3>
              <p>External ID: {transaction.externalId}</p>
              <p>Date: {new Date(transaction.date).toLocaleString()}</p>
              <p>Amount: {transaction.amount} {transaction.currency}</p>
              <p>Type: {transaction.type}</p>
              {transaction.sourceAccountKey && <p>Source Account: {transaction.sourceAccountKey}</p>}
              {transaction.targetAccountKey && <p>Target Account: {transaction.targetAccountKey}</p>}
              <p>Processed At: {transaction.processedAt ? new Date(transaction.processedAt).toLocaleString() : 'Not processed'}</p>
              
              <h4>Alerts ({transaction.alerts?.length || 0})</h4>
              {transaction.alerts && transaction.alerts.length > 0 ? (
                <StyledAlertList>
                  {transaction.alerts.map((alert: Alert) => (
                    <StyledAlertItem key={alert.id}>
                      <p>Alert ID: {alert.id}</p>
                      <p>Status: {alert.status}</p>
                      <p>Rule: {alert.rule.name}</p>
                    </StyledAlertItem>
                  ))}
                </StyledAlertList>
              ) : (
                <p>No alerts for this transaction.</p>
              )}
            </StyledListItem>
          ))}
        </StyledList>
      )}
    </StyledApp>
  );
}

export default App;
