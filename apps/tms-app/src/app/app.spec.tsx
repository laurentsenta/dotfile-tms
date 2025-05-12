import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import App from './app';
import { Provider } from '../components/ui/provider';

// Define the mocks for the GraphQL operations
const mocks = [
  {
    request: {
      query: gql`
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
      `,
    },
    result: {
      data: {
        transactions: [], // Empty array for initial render
      },
    },
  },
  {
    request: {
      query: gql`
        mutation CreateTransaction($input: CreateTransactionInput!) {
          createTransaction(input: $input) {
            id
            externalId
            date
            amount
            currency
            type
            sourceAccountKey
            targetAccountKey
            processedAt
          }
        }
      `,
      variables: {
        input: {
          externalId: expect.any(String),
          date: expect.any(String),
          amount: expect.any(Number),
          currency: expect.any(String),
          type: expect.any(String),
          sourceAccountKey: expect.any(String),
          targetAccountKey: expect.any(String),
        },
      },
    },
    result: {
      data: {
        createTransaction: {
          id: '1',
          externalId: 'test-id',
          date: new Date().toISOString(),
          amount: 100,
          currency: 'USD',
          type: 'CREDIT',
          sourceAccountKey: 'source-account',
          targetAccountKey: 'target-account',
          processedAt: null,
        },
      },
    },
  },
];


describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Provider>
          <App />
        </Provider>
      </MockedProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
