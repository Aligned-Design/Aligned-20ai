import { expect, afterEach, beforeAll, afterAll, vi, beforeEach } from 'vitest';

// Helper to create storage mock with actual data storage
const createStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

// Cleanup before each test
beforeEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  // DOM cleanup
  document.body.innerHTML = '';
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

// Set localStorage and sessionStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock DragEvent if not available
if (typeof DragEvent === 'undefined') {
  (global as any).DragEvent = class DragEvent extends Event {
    dataTransfer: any;
    constructor(type: string, eventInitDict?: EventInit) {
      super(type, eventInitDict);
      this.dataTransfer = {
        dropEffect: 'move',
        effectAllowed: 'move',
        files: [],
        items: [],
        types: [],
        getData: vi.fn(),
        setData: vi.fn(),
        clearData: vi.fn(),
        setDragImage: vi.fn(),
      };
    }
  };
}

// Mock StorageEvent if not available
if (typeof StorageEvent === 'undefined') {
  (global as any).StorageEvent = class StorageEvent extends Event {
    key: string | null;
    newValue: string | null;
    oldValue: string | null;
    storageArea: Storage | null;
    url: string;

    constructor(type: string, eventInitDict?: any) {
      super(type, eventInitDict);
      this.key = eventInitDict?.key ?? null;
      this.newValue = eventInitDict?.newValue ?? null;
      this.oldValue = eventInitDict?.oldValue ?? null;
      this.storageArea = eventInitDict?.storageArea ?? null;
      this.url = eventInitDict?.url ?? '';
    }
  };
}

// Mock web-vitals module
vi.mock('web-vitals', () => ({
  onCLS: vi.fn((callback) => callback({ name: 'CLS', value: 0.1, rating: 'good' })),
  onFID: vi.fn((callback) => callback({ name: 'FID', value: 100, rating: 'good' })),
  onFCP: vi.fn((callback) => callback({ name: 'FCP', value: 500, rating: 'good' })),
  onLCP: vi.fn((callback) => callback({ name: 'LCP', value: 1000, rating: 'good' })),
  onTTFB: vi.fn((callback) => callback({ name: 'TTFB', value: 300, rating: 'good' })),
}));

// Mock Sentry module
vi.mock('@sentry/react', async () => {
  const actual = await vi.importActual('@sentry/react');
  return {
    ...actual,
    init: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    setUser: vi.fn(),
    ErrorBoundary: ({ children }: any) => children,
    reactRouterV6Instrumentation: vi.fn(() => ({})),
    Replay: vi.fn(function() {
      return {};
    }),
  };
});

vi.mock('@sentry/tracing', () => ({
  BrowserTracing: vi.fn(() => ({})),
}));

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn((...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
        args[0].includes('Warning:'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
});
