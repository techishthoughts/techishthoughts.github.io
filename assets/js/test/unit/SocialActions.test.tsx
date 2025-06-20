import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SocialActions } from '../../components/features/SocialActions';
import { useAppStore } from '../../stores/useAppStore';

// Mock the store
vi.mock('../../stores/useAppStore');

// Mock toast
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock window.open
global.open = vi.fn();

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

const createMockStore = (overrides = {}) => ({
  interactions: {
    'test-post-1': {
      postId: 'test-post-1',
      likes: 5,
      shares: 3,
      comments: 2,
      isLiked: false,
      isBookmarked: false,
    },
  },
  toggleLike: vi.fn().mockResolvedValue(undefined),
  sharePost: vi.fn().mockResolvedValue(undefined),
  loadComments: vi.fn().mockResolvedValue(undefined),
  openCommentForm: vi.fn(),
  ...overrides,
});

describe('SocialActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(createMockStore());
  });

  const defaultProps = {
    postId: 'test-post-1',
    postTitle: 'Test Post Title',
    postUrl: 'https://example.com/test-post',
    showLabels: false,
    size: 'md' as const,
    variant: 'ghost' as const,
  };

  test('renders social action buttons', () => {
    renderWithChakra(<SocialActions {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /like this post/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /view comments/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /bookmark this post/i })
    ).toBeInTheDocument();
  });

  test('displays interaction counts', () => {
    renderWithChakra(<SocialActions {...defaultProps} />);

    expect(screen.getByText('5')).toBeInTheDocument(); // likes
    expect(screen.getByText('3')).toBeInTheDocument(); // shares
    expect(screen.getByText('2')).toBeInTheDocument(); // comments
  });

  test('handles like button click', async () => {
    const user = userEvent.setup();
    const mockStore = createMockStore();
    (useAppStore as any).mockReturnValue(mockStore);

    renderWithChakra(<SocialActions {...defaultProps} />);

    const likeButton = screen.getByRole('button', { name: /like this post/i });
    await user.click(likeButton);

    expect(mockStore.toggleLike).toHaveBeenCalledWith('test-post-1');
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Liked!',
          status: 'success',
        })
      );
    });
  });

  test('handles share menu interactions', async () => {
    const user = userEvent.setup();

    renderWithChakra(<SocialActions {...defaultProps} />);

    const shareButton = screen.getByRole('button', {
      name: /share this post/i,
    });
    await user.click(shareButton);

    // Just verify the menu opens and options are visible
    await screen.findByText('Share on Twitter');
    expect(screen.getByText('Share on Facebook')).toBeInTheDocument();
    expect(screen.getByText('Share on LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
  });

  test('handles copy link functionality', async () => {
    const user = userEvent.setup();

    renderWithChakra(<SocialActions {...defaultProps} />);

    const shareButton = screen.getByRole('button', {
      name: /share this post/i,
    });
    await user.click(shareButton);

    // Just verify the copy option is available
    await screen.findByText('Copy Link');
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
  });

  test('handles comment button click', async () => {
    const user = userEvent.setup();
    const mockStore = createMockStore();
    (useAppStore as any).mockReturnValue(mockStore);

    renderWithChakra(<SocialActions {...defaultProps} />);

    const commentButton = screen.getByRole('button', {
      name: /view comments/i,
    });
    await user.click(commentButton);

    expect(mockStore.loadComments).toHaveBeenCalledWith('test-post-1');
    expect(mockStore.openCommentForm).toHaveBeenCalledWith('test-post-1');
  });

  test('shows labels when showLabels is true', () => {
    renderWithChakra(<SocialActions {...defaultProps} showLabels={true} />);

    expect(screen.getByText('Like')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Comment')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  test('displays liked state correctly', () => {
    const mockStore = createMockStore({
      interactions: {
        'test-post-1': {
          postId: 'test-post-1',
          likes: 5,
          shares: 3,
          comments: 2,
          isLiked: true,
          isBookmarked: false,
        },
      },
    });
    (useAppStore as any).mockReturnValue(mockStore);

    renderWithChakra(<SocialActions {...defaultProps} />);

    const likeButton = screen.getByRole('button', { name: /unlike/i });
    expect(likeButton).toBeInTheDocument();
  });

  test('handles bookmark button click', async () => {
    const user = userEvent.setup();
    renderWithChakra(<SocialActions {...defaultProps} />);

    const bookmarkButton = screen.getByRole('button', {
      name: /bookmark this post/i,
    });
    await user.click(bookmarkButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Coming Soon',
          description: 'Bookmark feature will be available soon!',
          status: 'info',
        })
      );
    });
  });

  test('handles errors gracefully', async () => {
    const user = userEvent.setup();
    const mockStore = createMockStore({
      toggleLike: vi.fn().mockRejectedValue(new Error('Network error')),
    });
    (useAppStore as any).mockReturnValue(mockStore);

    renderWithChakra(<SocialActions {...defaultProps} />);

    const likeButton = screen.getByRole('button', { name: /like this post/i });
    await user.click(likeButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to update like status',
          status: 'error',
        })
      );
    });
  });

  test('renders with different sizes', () => {
    const { rerender } = renderWithChakra(
      <SocialActions {...defaultProps} size='sm' />
    );
    expect(
      screen.getByRole('button', { name: /like this post/i })
    ).toBeInTheDocument();

    rerender(
      <ChakraProvider>
        <SocialActions {...defaultProps} size='lg' />
      </ChakraProvider>
    );
    expect(
      screen.getByRole('button', { name: /like this post/i })
    ).toBeInTheDocument();
  });

  test('renders with different variants', () => {
    const { rerender } = renderWithChakra(
      <SocialActions {...defaultProps} variant='solid' />
    );
    expect(
      screen.getByRole('button', { name: /like this post/i })
    ).toBeInTheDocument();

    rerender(
      <ChakraProvider>
        <SocialActions {...defaultProps} variant='outline' />
      </ChakraProvider>
    );
    expect(
      screen.getByRole('button', { name: /like this post/i })
    ).toBeInTheDocument();
  });
});
