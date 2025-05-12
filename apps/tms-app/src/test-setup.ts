// Import Jest types
import { jest } from '@jest/globals';
import * as structuredCloneUngap from '@ungap/structured-clone';

// See https://github.com/jsdom/jsdom/issues/3363
// @ts-expect-error: temporary workaround for structuredClone
global.structuredClone = structuredCloneUngap.default;

// Mock for window.matchMedia
// See https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: unknown) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
