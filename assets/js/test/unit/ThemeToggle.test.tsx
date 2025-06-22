import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock matchMedia
const mockMatchMedia = vi.fn();

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true,
    });

    // Mock document.documentElement.classList
    const mockClassList = {
      toggle: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    };

    Object.defineProperty(document.documentElement, 'classList', {
      value: mockClassList,
      writable: true,
    });
  });

  it('renders theme toggle button', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: false });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(button).toHaveAttribute('data-testid', 'theme-toggle');
  });

  it('shows moon icon in light mode', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: false });

    render(<ThemeToggle />);

    const moonIcon = screen.getByRole('button').querySelector('svg');
    expect(moonIcon).toBeInTheDocument();
    expect(moonIcon).toHaveClass('text-gray-700');
  });

  it('initializes with saved theme preference', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    mockMatchMedia.mockReturnValue({ matches: false });

    render(<ThemeToggle />);

    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
      'dark',
      true
    );
  });

  it('defaults to light mode when no saved theme', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: true });

    render(<ThemeToggle />);

    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
      'dark',
      false
    );
  });

  it('toggles theme when clicked', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: false });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'dark',
        true
      );
    });
  });

  it('updates aria-label when theme changes', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: false });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });
  });

  it('shows sun icon in dark mode', async () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    mockMatchMedia.mockReturnValue({ matches: false });

    render(<ThemeToggle />);

    await waitFor(() => {
      const sunIcon = screen.getByRole('button').querySelector('svg');
      expect(sunIcon).toBeInTheDocument();
      expect(sunIcon).toHaveClass('text-yellow-500');
    });
  });

  it('applies custom className prop', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: false });

    render(<ThemeToggle className='custom-class' />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles theme toggle from light to dark to light', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: false });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Start in light mode
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

    // Click to go to dark mode
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    // Click to go back to light mode
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });
  });
});
