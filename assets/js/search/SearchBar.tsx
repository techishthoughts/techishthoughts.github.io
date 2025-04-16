import React from 'react';
import {
  Input,
  InputGroup,
  InputLeftAddon,
  Icon
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

interface Props {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <InputGroup>
      <InputLeftAddon>
        <Icon as={SearchIcon} color="gray.500" />
      </InputLeftAddon>
      <Input
        placeholder="Search posts..."
        onChange={handleChange}
        bg="white"
        borderRadius="md"
      />
    </InputGroup>
  );
};

export default SearchBar;