// Vitest setup for jsdom-based component tests.
// jsdom lacks several browser APIs the app touches at render time:
// - matchMedia: useMobile's media query
// - ResizeObserver / IntersectionObserver: radix + framer-motion internals
// - scrollIntoView: onboarding auto-scroll
// Node-environment tests are unaffected (guards are no-ops without window).

if (typeof window !== "undefined") {
  if (!window.matchMedia) {
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
        dispatchEvent: () => false,
      }),
    });
  }

  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.ResizeObserver = window.ResizeObserver ?? (NoopObserver as unknown as typeof ResizeObserver);
  window.IntersectionObserver =
    window.IntersectionObserver ?? (NoopObserver as unknown as typeof IntersectionObserver);

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}
