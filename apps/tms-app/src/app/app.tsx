import { useQuery, gql } from '@apollo/client';
import Layout from '../components/layout/Layout';
import TransactionTable from '../components/transactions/TransactionTable';
import { Box, Heading, Text } from '@chakra-ui/react';

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

  return (
    <Layout>
      {error ? (
        <Text color="red.500">Error: {error.message}</Text>
      ) : (
        <TransactionTable
          transactions={data?.transactions || []}
          isLoading={loading}
        />
      )}
    </Layout>
  );
}

export default App;
