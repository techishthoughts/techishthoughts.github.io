import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { SearchProvider } from './context/SearchContext';
import App from './search/App';

const root = document.getElementById('search-root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <SearchProvider>
          <App />
        </SearchProvider>
      </ChakraProvider>
    </React.StrictMode>
  );
}