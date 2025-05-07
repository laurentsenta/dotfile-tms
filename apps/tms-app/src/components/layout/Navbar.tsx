import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { LuLayoutDashboard, LuSettings } from 'react-icons/lu';
import { ColorModeButton } from '../ui/color-mode';

export default function Navbar() {
  return (
    <Box
      bg="bg.surface"
      px={4}
      py={2}
      borderBottom="1px"
      borderColor="border.default"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Text fontSize="xl" fontWeight="bold" color="fg.emphasized">
          Transaction Monitoring System
        </Text>

        <Flex gap={4} alignItems="center">
          <Button variant="ghost" size="sm">
            <LuLayoutDashboard/>
            Dashboard
          </Button>
          <Button variant="ghost" size="sm">
            <LuSettings />
            Settings
          </Button>
          <ColorModeButton />
        </Flex>
      </Flex>
    </Box>
  );
}
