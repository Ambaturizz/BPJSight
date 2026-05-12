import "@testing-library/jest-dom";
import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});


Element.prototype.scrollIntoView = vi.fn();

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});




// React Router v6 prints v7 future-flag notices in tests. They are not app failures,
// so keep test output clean while preserving all other console warnings/errors.
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const message = String(args[0] ?? "");
  if (message.includes("React Router Future Flag Warning")) return;
  originalWarn(...args);
};
