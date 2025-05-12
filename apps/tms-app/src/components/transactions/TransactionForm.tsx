import { gql, useMutation } from '@apollo/client';
import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  Input,
  NativeSelect,
  NumberInput,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toaster } from '../../components/ui/toaster';

// Define the GraphQL mutation
const CREATE_TRANSACTION = gql`
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
`;

// Define the transaction type enum
enum TransactionTypeEnum {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  TRANSFER = 'TRANSFER',
}

// Define the form values interface
interface FormValues {
  externalId: string;
  date: string;
  sourceAccountKey: string;
  targetAccountKey: string;
  amount: number;
  currency: string;
  type: TransactionTypeEnum;
}

interface TransactionFormProps {
  onTransactionCreated?: () => void;
}

export default function TransactionForm({
  onTransactionCreated,
}: TransactionFormProps) {
  const [formValues, setFormValues] = useState<FormValues>({
    externalId: uuidv4(),
    date: new Date().toISOString().split('T')[0],
    sourceAccountKey: '',
    targetAccountKey: '',
    amount: 0.01,
    currency: 'USD',
    type: TransactionTypeEnum.CREDIT,
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});

  const [createTransaction, { loading }] = useMutation(CREATE_TRANSACTION, {
    onCompleted: () => {
      toaster.success({
        title: 'Transaction created',
        description: 'The transaction has been created successfully',
        duration: 5000,
      });

      // Reset form
      setFormValues({
        externalId: uuidv4(),
        date: new Date().toISOString().split('T')[0],
        sourceAccountKey: '',
        targetAccountKey: '',
        amount: 0.01,
        currency: 'USD',
        type: TransactionTypeEnum.CREDIT,
      });

      // Notify parent component
      if (onTransactionCreated) {
        onTransactionCreated();
      }
    },
    onError: (error) => {
      toaster.error({
        title: 'Error creating transaction',
        description: error.message,
        duration: 5000,
      });
    },
  });

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (formErrors[name as keyof FormValues]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle amount change
  const handleAmountChange = (value: { value: string }) => {
    const numValue = parseFloat(value.value || '0');
    setFormValues((prev) => ({ ...prev, amount: numValue }));

    // Clear error for amount field
    if (formErrors.amount) {
      setFormErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!formValues.externalId) {
      errors.externalId = 'External ID is required';
    }

    if (!formValues.date) {
      errors.date = 'Date is required';
    }

    if (formValues.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (!formValues.currency) {
      errors.currency = 'Currency is required';
    }

    if (!formValues.type) {
      errors.type = 'Type is required';
    }

    // For TRANSFER type, both source and target accounts are required
    if (formValues.type === TransactionTypeEnum.TRANSFER) {
      if (!formValues.sourceAccountKey) {
        errors.sourceAccountKey = 'Source account is required for transfers';
      }

      if (!formValues.targetAccountKey) {
        errors.targetAccountKey = 'Target account is required for transfers';
      }
    }

    // For CREDIT type, target account is required
    if (
      formValues.type === TransactionTypeEnum.CREDIT &&
      !formValues.targetAccountKey
    ) {
      errors.targetAccountKey = 'Target account is required for credits';
    }

    // For DEBIT type, source account is required
    if (
      formValues.type === TransactionTypeEnum.DEBIT &&
      !formValues.sourceAccountKey
    ) {
      errors.sourceAccountKey = 'Source account is required for debits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      createTransaction({
        variables: {
          input: {
            externalId: formValues.externalId,
            date: new Date(formValues.date).toISOString(),
            sourceAccountKey: formValues.sourceAccountKey || undefined,
            targetAccountKey: formValues.targetAccountKey || undefined,
            amount: formValues.amount * 100,
            currency: formValues.currency,
            type: formValues.type,
          },
        },
      });
    }
  };

  return (
    <Card.Root mb={6}>
      <Card.Header>
        <Text fontSize="lg" fontWeight="medium">
          Create New Transaction
        </Text>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Flex gap={4}>
              <Field.Root invalid={!!formErrors.externalId}>
                <Field.Label>External ID</Field.Label>
                <Input
                  name="externalId"
                  value={formValues.externalId}
                  onChange={handleChange}
                  placeholder="External ID"
                />
                <Field.ErrorText>{formErrors.externalId}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!formErrors.date}>
                <Field.Label>Date</Field.Label>
                <Input
                  name="date"
                  type="date"
                  value={formValues.date}
                  onChange={handleChange}
                />
                <Field.ErrorText>{formErrors.date}</Field.ErrorText>
              </Field.Root>
            </Flex>

            <Flex gap={4}>
              <Field.Root invalid={!!formErrors.type} width="150px">
                <Field.Label>Type</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    name="type"
                    value={formValues.type}
                    onChange={handleChange}
                  >
                    <option value={TransactionTypeEnum.CREDIT}>Credit</option>
                    <option value={TransactionTypeEnum.DEBIT}>Debit</option>
                    <option value={TransactionTypeEnum.TRANSFER}>
                      Transfer
                    </option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                <Field.ErrorText>{formErrors.type}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!formErrors.amount} flex="1" width="100%">
                <Field.Label>Amount</Field.Label>
                <NumberInput.Root
                  min={0.01}
                  step={0.01}
                  value={formValues.amount.toString()}
                  onValueChange={(details: { value: string }) =>
                    handleAmountChange(details)
                  }
                  width="100%"
                >
                  <NumberInput.Control />
                  <NumberInput.Input />
                </NumberInput.Root>
                <Field.ErrorText>{formErrors.amount}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!formErrors.currency} width="120px">
                <Field.Label>Currency</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    name="currency"
                    value={formValues.currency}
                    onChange={handleChange}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                <Field.ErrorText>{formErrors.currency}</Field.ErrorText>
              </Field.Root>
            </Flex>

            <Flex gap={4}>
              <Field.Root invalid={!!formErrors.sourceAccountKey}>
                <Field.Label>Source Account</Field.Label>
                <Input
                  name="sourceAccountKey"
                  value={formValues.sourceAccountKey}
                  onChange={handleChange}
                  placeholder="Source Account"
                />
                <Field.ErrorText>{formErrors.sourceAccountKey}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!formErrors.targetAccountKey}>
                <Field.Label>Target Account</Field.Label>
                <Input
                  name="targetAccountKey"
                  value={formValues.targetAccountKey}
                  onChange={handleChange}
                  placeholder="Target Account"
                />
                <Field.ErrorText>{formErrors.targetAccountKey}</Field.ErrorText>
              </Field.Root>
            </Flex>

            <Box textAlign="right">
              <Button type="submit" colorPalette="blue" loading={loading}>
                Create Transaction
              </Button>
            </Box>
          </Stack>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
