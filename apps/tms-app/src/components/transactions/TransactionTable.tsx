import {
  Badge,
  Box,
  Card,
  Flex,
  IconButton,
  Input,
  Menu,
  Table,
  Text,
} from '@chakra-ui/react';
import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { FaFilter, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';

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
  isLoading = false,
}: TransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columnHelper = createColumnHelper<Transaction>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('externalId', {
        header: 'ID',
        cell: (info) => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor('date', {
        header: 'Date',
        cell: (info) => new Date(info.getValue()).toLocaleString(),
        enableSorting: true,
        enableColumnFilter: true,
        sortingFn: (rowA, rowB, columnId) => {
          const dateA = new Date(rowA.original.date).getTime();
          const dateB = new Date(rowB.original.date).getTime();
          return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
        },
      }),
      columnHelper.accessor((row) => `${(row.amount / 100).toFixed(2)} ${row.currency}`, {
        id: 'amount',
        header: 'Amount',
        cell: (info) => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
        sortingFn: (rowA, rowB, columnId) => {
          return rowA.original.amount < rowB.original.amount
            ? -1
            : rowA.original.amount > rowB.original.amount
            ? 1
            : 0;
        },
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor('sourceAccountKey', {
        header: 'Source',
        cell: (info) => info.getValue() || '-',
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor('targetAccountKey', {
        header: 'Target',
        cell: (info) => info.getValue() || '-',
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor((row) => row.alerts?.length || 0, {
        id: 'alerts',
        header: 'Alerts',
        cell: (info) => {
          const alertCount = info.getValue();
          return alertCount > 0 ? (
            <Badge colorScheme="red">{alertCount} Alert(s)</Badge>
          ) : (
            <Badge colorScheme="green">No Alerts</Badge>
          );
        },
        enableSorting: true,
        enableColumnFilter: false,
      }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return <Text>Loading transactions...</Text>;
  }

  if (!transactions || transactions.length === 0) {
    return <Text>No transactions found.</Text>;
  }

  return (
    <Card.Root>
      <Card.Header>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="lg" fontWeight="medium">
            Transactions
          </Text>
          <Box>
            <Input
              placeholder="Search all columns..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              size="sm"
              width="300px"
            />
          </Box>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Box overflowX="auto">
          <Table.Root>
            <Table.Header>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Row key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Table.Cell as="th" key={header.id}>
                      {header.isPlaceholder ? null : (
                        <Flex alignItems="center">
                          <Box
                            cursor={
                              header.column.getCanSort() ? 'pointer' : 'default'
                            }
                            onClick={header.column.getToggleSortingHandler()}
                            flex="1"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </Box>
                          {header.column.getCanSort() && (
                            <Box ml={1}>
                              {header.column.getIsSorted() === 'asc' ? (
                                <FaSortUp />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <FaSortDown />
                              ) : (
                                <FaSort color="gray" />
                              )}
                            </Box>
                          )}
                          {header.column.getCanFilter() && (
                            <Menu.Root>
                              <Menu.Trigger asChild>
                                <IconButton
                                  aria-label="Filter"
                                  variant="ghost"
                                  size="xs"
                                  ml={2}
                                >
                                  <FaFilter />
                                </IconButton>
                              </Menu.Trigger>
                              <Menu.Positioner>
                                <Menu.Content>
                                  <Box p={2}>
                                    <Input
                                      placeholder={`Filter ${header.column.columnDef.header}...`}
                                      value={
                                        (header.column.getFilterValue() as string) ??
                                        ''
                                      }
                                      onChange={(e) =>
                                        header.column.setFilterValue(
                                          e.target.value
                                        )
                                      }
                                      size="sm"
                                    />
                                  </Box>
                                </Menu.Content>
                              </Menu.Positioner>
                            </Menu.Root>
                          )}
                        </Flex>
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Header>
            <Table.Body>
              {table.getRowModel().rows.map((row) => (
                <Table.Row key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
