import { Box, Text, Flex } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box bg="bg.surface" px={4} py={4} borderTop="1px" borderColor="border.default">
      <Flex justifyContent="center" alignItems="center">
        <Text fontSize="sm" color="fg.muted">
          © {new Date().getFullYear()} Transaction Monitoring System. All rights reserved.
        </Text>
      </Flex>
    </Box>
  );
}
