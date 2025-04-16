import React, { useState } from 'react';
import { Box, Container } from '@chakra-ui/react';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';

export interface Post {
  title: string;
  permalink: string;
  summary: string;
  author: string;
}

const App: React.FC = () => {
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/index.json');
      const posts: Post[] = await response.json();
      const results = posts.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.summary.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } catch (error) {
      setSearchResults([]);
    }
    setIsLoading(false);
  };

  return (
    <Container maxW="container.lg">
      <Box py={4}>
        <SearchBar onSearch={handleSearch} />
        <SearchResults results={searchResults} isLoading={isLoading} />
      </Box>
    </Container>
  );
};

export default App;