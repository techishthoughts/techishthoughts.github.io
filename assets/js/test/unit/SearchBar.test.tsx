import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../../components/SearchBar';
import { SearchProvider } from '../../context/SearchContext';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock data
const mockSearchData = [
  {
    title: 'React 18 Concurrent Features',
    url: '/posts/react-18-concurrent-features/',
    content:
      'Learn about React 18 concurrent features and how they improve performance',
    summary: 'A comprehensive guide to React 18 concurrent features',
    author: 'Arthur Costa',
    date: '2024-01-15',
    tags: ['react', 'javascript', 'performance'],
  },
  {
    title: 'TypeScript Advanced Patterns',
    url: '/posts/typescript-advanced-patterns/',
    content: 'Advanced TypeScript patterns for better code organization',
    summary: 'Master advanced TypeScript patterns',
    author: 'Lucas Oliveira',
    date: '2024-01-10',
    tags: ['typescript', 'patterns', 'javascript'],
  },
];

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    <SearchProvider>{children}</SearchProvider>
  </ChakraProvider>
);

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSearchData),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders search input with correct placeholder', () => {
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    expect(
      screen.getByPlaceholderText('Search articles, authors, tags...')
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows search icon in input', () => {
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    // Search icon should be visible
    const searchIcon = document.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('updates input value when typing', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'react');

    expect(input).toHaveValue('react');
  });

  it('shows clear button when input has value', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'react');

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'react');

    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('does not trigger search for short queries', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'ab');

    // Wait a bit to ensure debounce would have triggered
    await new Promise(resolve => setTimeout(resolve, 400));

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('triggers search for queries with 3+ characters', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'react');

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockFetch).toHaveBeenCalledWith('/index.json');
      },
      { timeout: 1000 }
    );
  });

  it('displays search results correctly', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'react');

    await waitFor(
      () => {
        expect(
          screen.getByText('React 18 Concurrent Features')
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            'A comprehensive guide to React 18 concurrent features'
          )
        ).toBeInTheDocument();
        expect(screen.getByText('by Arthur Costa')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('filters results by title', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'typescript');

    await waitFor(
      () => {
        expect(
          screen.getByText('TypeScript Advanced Patterns')
        ).toBeInTheDocument();
        expect(
          screen.queryByText('React 18 Concurrent Features')
        ).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('shows "no results" message when no matches found', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'nonexistent');

    await waitFor(
      () => {
        expect(
          screen.getByText('No results found for "nonexistent"')
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('handles fetch errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock fetch error
    mockFetch.mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'react');

    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Search error:',
          expect.any(Error)
        );
      },
      { timeout: 2000 }
    );

    consoleSpy.mockRestore();
  });

  it('displays tags as badges in search results', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'react');

    await waitFor(
      () => {
        expect(screen.getByText('react')).toBeInTheDocument();
        expect(screen.getByText('javascript')).toBeInTheDocument();
        expect(screen.getByText('performance')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('handles empty search data gracefully', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'react');

    await waitFor(
      () => {
        expect(
          screen.getByText('No results found for "react"')
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('handles missing author and tags gracefully', async () => {
    const user = userEvent.setup();

    const dataWithMissingFields = [
      {
        title: 'Test Article',
        url: '/test/',
        content: 'Test content',
        date: '2024-01-01',
        // Missing author and tags
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dataWithMissingFields),
    });

    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    await waitFor(
      () => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
        expect(screen.getByText('by Unknown')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
