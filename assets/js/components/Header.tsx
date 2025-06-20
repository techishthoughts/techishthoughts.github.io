import { CloseIcon, HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Box,
  Collapse,
  Container,
  Flex,
  HStack,
  IconButton,
  Link,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import React from 'react';
import SearchBar from './SearchBar';

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure();

  const bg = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.600', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bg}
      color={color}
      borderBottom={1}
      borderStyle='solid'
      borderColor={borderColor}
      position='sticky'
      top={0}
      zIndex={1000}
      shadow='sm'
    >
      <Container maxW='container.xl'>
        <Flex minH='60px' py={2} align='center' justify='space-between'>
          {/* Logo and Brand */}
          <Flex align='center'>
            <IconButton
              onClick={onToggle}
              icon={
                isOpen ? (
                  <CloseIcon w={3} h={3} />
                ) : (
                  <HamburgerIcon w={5} h={5} />
                )
              }
              variant='ghost'
              aria-label='Toggle Navigation'
              display={{ base: 'block', md: 'none' }}
            />
            <Link href='/' _hover={{ textDecoration: 'none' }}>
              <Text
                fontSize={{ base: 'lg', md: '2xl' }}
                fontWeight='bold'
                bgGradient='linear(to-r, blue.400, purple.500)'
                bgClip='text'
                ml={{ base: 2, md: 0 }}
              >
                Tech.ish Thoughts
              </Text>
            </Link>
          </Flex>

          {/* Desktop Navigation */}
          <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
            <Link
              href='/'
              fontSize='md'
              fontWeight={500}
              _hover={{ color: 'blue.500', textDecoration: 'none' }}
            >
              Home
            </Link>
            <Link
              href='/posts/'
              fontSize='md'
              fontWeight={500}
              _hover={{ color: 'blue.500', textDecoration: 'none' }}
            >
              Articles
            </Link>
            <Link
              href='/authors/'
              fontSize='md'
              fontWeight={500}
              _hover={{ color: 'blue.500', textDecoration: 'none' }}
            >
              Authors
            </Link>
            <Link
              href='/tags/'
              fontSize='md'
              fontWeight={500}
              _hover={{ color: 'blue.500', textDecoration: 'none' }}
            >
              Tags
            </Link>
          </HStack>

          {/* Search and Theme Toggle */}
          <HStack spacing={4}>
            <Box display={{ base: 'none', md: 'block' }} w='300px'>
              <SearchBar />
            </Box>
            <IconButton
              aria-label='Toggle color mode'
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant='ghost'
              size='md'
              data-testid='dark-mode-toggle'
            />
          </HStack>
        </Flex>

        {/* Mobile Navigation */}
        <Collapse in={isOpen} animateOpacity>
          <Box pb={4} display={{ md: 'none' }}>
            <Stack spacing={4}>
              <Box mb={4}>
                <SearchBar />
              </Box>
              <Link
                href='/'
                fontSize='md'
                fontWeight={500}
                _hover={{ color: 'blue.500', textDecoration: 'none' }}
              >
                Home
              </Link>
              <Link
                href='/posts/'
                fontSize='md'
                fontWeight={500}
                _hover={{ color: 'blue.500', textDecoration: 'none' }}
              >
                Articles
              </Link>
              <Link
                href='/authors/'
                fontSize='md'
                fontWeight={500}
                _hover={{ color: 'blue.500', textDecoration: 'none' }}
              >
                Authors
              </Link>
              <Link
                href='/tags/'
                fontSize='md'
                fontWeight={500}
                _hover={{ color: 'blue.500', textDecoration: 'none' }}
              >
                Tags
              </Link>
            </Stack>
          </Box>
        </Collapse>
      </Container>
    </Box>
  );
};

export default Header;
