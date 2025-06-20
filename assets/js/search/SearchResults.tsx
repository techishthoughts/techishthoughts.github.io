import { Box, Heading, Link, Spinner, Stack, Text } from '@chakra-ui/react';
import React from 'react';

interface Post {
  title: string;
  permalink: string;
  summary: string;
  author: string;
  date: string;
  tags?: string[];
}

interface Props {
  results: Post[];
  isLoading: boolean;
}

const SearchResults: React.FC<Props> = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <Box textAlign='center' py={8}>
        <Spinner />
      </Box>
    );
  }

  if (!results.length) {
    return null;
  }

  return (
    <Stack spacing='4' mt={4}>
      {results.map((post, index) => (
        <Box
          key={index}
          p={4}
          borderRadius='md'
          borderWidth='1px'
          _hover={{ bg: 'gray.50' }}
        >
          <Link href={post.permalink}>
            <Heading size='md'>{post.title}</Heading>
          </Link>
          <Text color='gray.600' mt={2}>
            {post.summary}
          </Text>
          <Text fontSize='sm' color='gray.500' mt={2}>
            By {post.author}
          </Text>
        </Box>
      ))}
    </Stack>
  );
};

export default SearchResults;
