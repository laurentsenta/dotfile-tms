import { gql, useQuery } from '@apollo/client';
import { Text } from '@chakra-ui/react';
import Layout from '../components/layout/Layout';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionTable from '../components/transactions/TransactionTable';
import { Toaster } from '../components/ui/toaster';

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
  const { loading, error, data, refetch } = useQuery(GET_TRANSACTIONS);

  return (
    <Layout>
      <TransactionForm onTransactionCreated={() => refetch()} />

      {error ? (
        <Text color="red.500">Error: {error.message}</Text>
      ) : (
        <TransactionTable
          transactions={data?.transactions || []}
          isLoading={loading}
        />
      )}
      <Toaster />
    </Layout>
  );
}

export default App;
