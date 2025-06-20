import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Speech Synthesis API with proper types
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  speaking: false,
  pending: false,
  paused: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(() => true),
  onvoiceschanged: null,
};

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  configurable: true,
  value: mockSpeechSynthesis,
});

// Mock SpeechSynthesisUtterance
const mockSpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
  text: '',
  lang: 'en-US',
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  onstart: null,
  onend: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onmark: null,
  onboundary: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(() => true),
}));

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  writable: true,
  configurable: true,
  value: mockSpeechSynthesisUtterance,
});

// Mock IntersectionObserver with proper interface
class MockIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];

  constructor(
    _callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit
  ) {
    // Store callback and options if needed for testing
  }

  observe(_target: Element): void {
    // Mock implementation
  }

  unobserve(_target: Element): void {
    // Mock implementation
  }

  disconnect(): void {
    // Mock implementation
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver with proper interface
class MockResizeObserver implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {
    // Store callback if needed for testing
  }

  observe(_target: Element, _options?: ResizeObserverOptions): void {
    // Mock implementation
  }

  unobserve(_target: Element): void {
    // Mock implementation
  }

  disconnect(): void {
    // Mock implementation
  }
}

global.ResizeObserver = MockResizeObserver;

// Mock localStorage with proper Storage interface
const mockLocalStorage: Storage = {
  length: 0,
  clear: vi.fn(),
  getItem: vi.fn((_key: string) => null),
  key: vi.fn((_index: number) => null),
  removeItem: vi.fn(),
  setItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  writable: true,
  configurable: true,
  value: mockLocalStorage,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  configurable: true,
  value: mockLocalStorage,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock URL methods
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'mocked-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    redirected: false,
    type: 'basic' as ResponseType,
    url: 'http://localhost:3000',
  } as unknown as Response)
);

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};
