import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, theme } from '@chakra-ui/react';
import App from './search/App';

const root = document.getElementById('search-root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </React.StrictMode>
  );
}