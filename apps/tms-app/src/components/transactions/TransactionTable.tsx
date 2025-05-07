import {
  Table,
  Box,
  Text,
  Badge,
  Card,
} from '@chakra-ui/react';

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

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export default function TransactionTable({ 
  transactions, 
  isLoading = false 
}: TransactionTableProps) {
  if (isLoading) {
    return <Text>Loading transactions...</Text>;
  }

  if (!transactions || transactions.length === 0) {
    return <Text>No transactions found.</Text>;
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontSize="lg" fontWeight="medium">Transactions</Text>
      </Card.Header>
      <Card.Body>
        <Box overflowX="auto">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Cell as="th">ID</Table.Cell>
                <Table.Cell as="th">Date</Table.Cell>
                <Table.Cell as="th">Amount</Table.Cell>
                <Table.Cell as="th">Type</Table.Cell>
                <Table.Cell as="th">Source</Table.Cell>
                <Table.Cell as="th">Target</Table.Cell>
                <Table.Cell as="th">Alerts</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {transactions.map((transaction) => (
                <Table.Row key={transaction.id}>
                  <Table.Cell>{transaction.externalId}</Table.Cell>
                  <Table.Cell>{new Date(transaction.date).toLocaleString()}</Table.Cell>
                  <Table.Cell>
                    {transaction.amount} {transaction.currency}
                  </Table.Cell>
                  <Table.Cell>{transaction.type}</Table.Cell>
                  <Table.Cell>{transaction.sourceAccountKey || '-'}</Table.Cell>
                  <Table.Cell>{transaction.targetAccountKey || '-'}</Table.Cell>
                  <Table.Cell>
                    {transaction.alerts && transaction.alerts.length > 0 ? (
                      <Badge colorScheme="red">
                        {transaction.alerts.length} Alert(s)
                      </Badge>
                    ) : (
                      <Badge colorScheme="green">No Alerts</Badge>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
