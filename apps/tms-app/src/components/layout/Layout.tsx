import { Box, Flex } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Flex direction="column" height="100vh">
      <Navbar />
      <Flex flex="1" overflow="hidden">
        <Sidebar />
        <Box
          as="main"
          flex="1"
          overflow="auto"
          p={6}
          bg="bg.canvas"
        >
          {children}
          
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}
