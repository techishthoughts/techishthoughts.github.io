import { CloseIcon, SearchIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useSearch } from '../context/SearchContext';

interface SearchResult {
  title: string;
  url: string;
  summary: string;
  author: string;
  date: string;
  tags: string[];
}

const SearchBar: React.FC = () => {
  const { query, setQuery } = useSearch();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const resultBg = useColorModeValue('gray.50', 'gray.700');

  const searchPosts = async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) return [];

    try {
      const response = await fetch('/index.json');
      const data = await response.json();

      const filtered = data.filter(
        (post: any) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags?.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );

      return filtered.map((post: any) => ({
        title: post.title,
        url: post.url,
        summary: post.summary || post.content.substring(0, 150) + '...',
        author: post.author || 'Unknown',
        date: post.date,
        tags: post.tags || [],
      }));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  useEffect(() => {
    const performSearch = async () => {
      if (query.length > 2) {
        setIsLoading(true);
        const searchResults = await searchPosts(query);
        setResults(searchResults);
        setShowResults(true);
        setIsLoading(false);
      } else {
        setResults([]);
        setShowResults(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <Box position='relative' maxW='600px' mx='auto'>
      <InputGroup size='lg'>
        <InputLeftElement pointerEvents='none'>
          <SearchIcon color='gray.400' />
        </InputLeftElement>
        <Input
          placeholder='Search articles, authors, tags...'
          value={query}
          onChange={e => setQuery(e.target.value)}
          bg={bgColor}
          border='2px'
          borderColor={borderColor}
          _hover={{ borderColor: 'blue.300' }}
          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
          borderRadius='full'
        />
        {query && (
          <InputRightElement>
            <IconButton
              aria-label='Clear search'
              icon={<CloseIcon />}
              size='sm'
              variant='ghost'
              onClick={handleClear}
            />
          </InputRightElement>
        )}
      </InputGroup>

      {showResults && (
        <Box
          position='absolute'
          top='60px'
          left='0'
          right='0'
          bg={bgColor}
          border='1px'
          borderColor={borderColor}
          borderRadius='lg'
          boxShadow='lg'
          zIndex='1000'
          maxH='400px'
          overflowY='auto'
        >
          {isLoading ? (
            <Box p={4} textAlign='center'>
              <Spinner size='md' />
            </Box>
          ) : results.length > 0 ? (
            <VStack spacing={0} align='stretch'>
              {results.map((result, index) => (
                <Link
                  key={index}
                  href={result.url}
                  _hover={{ textDecoration: 'none' }}
                >
                  <Box
                    p={4}
                    _hover={{ bg: resultBg }}
                    borderBottom={index < results.length - 1 ? '1px' : 'none'}
                    borderColor={borderColor}
                  >
                    <Text fontWeight='semibold' fontSize='lg' mb={1}>
                      {result.title}
                    </Text>
                    <Text fontSize='sm' color='gray.600' mb={2}>
                      {result.summary}
                    </Text>
                    <HStack spacing={2} wrap='wrap'>
                      <Text fontSize='xs' color='gray.500'>
                        by {result.author}
                      </Text>
                      <Text fontSize='xs' color='gray.500'>
                        {new Date(result.date).toLocaleDateString()}
                      </Text>
                      {result.tags.map(tag => (
                        <Badge key={tag} size='sm' colorScheme='blue'>
                          {tag}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                </Link>
              ))}
            </VStack>
          ) : (
            <Box p={4} textAlign='center'>
              <Text color='gray.500'>No results found for "{query}"</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;
