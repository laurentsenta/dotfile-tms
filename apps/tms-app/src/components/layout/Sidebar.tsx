import { Box, Icon, Text, VStack } from '@chakra-ui/react';
import { LuBellRing, LuCreditCard, LuFilePenLine, LuLayoutDashboard } from 'react-icons/lu';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
}

function SidebarItem({ icon, label, isActive = false }: SidebarItemProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      px={4}
      py={3}
      cursor="pointer"
      borderRadius="md"
      bg={isActive ? 'bg.subtle' : 'transparent'}
      color={isActive ? 'fg.emphasized' : 'fg.default'}
      fontWeight={isActive ? 'medium' : 'normal'}
      _hover={{ bg: 'bg.subtle' }}
      width="full"
    >
      <Icon as={icon} mr={3} boxSize={5} />
      <Text>{label}</Text>
    </Box>
  );
}

export default function Sidebar() {
  return (
    <Box
      as="aside"
      bg="bg.surface"
      width="240px"
      height="100%"
      borderRight="1px"
      borderColor="border.default"
      py={6}
    >
      <VStack align="stretch" gap={1}>
        <SidebarItem icon={LuLayoutDashboard} label="Dashboard" isActive />
        <SidebarItem icon={LuBellRing} label="Alerts" />
        <SidebarItem icon={LuFilePenLine} label="Rules" />

        <Box borderTop="1px" borderColor="border.default" my={6} />
      </VStack>
    </Box>
  );
}
