import "@testing-library/jest-dom/vitest";

/**
 * jsdom does not implement IntersectionObserver, which framer-motion uses for
 * its `whileInView` entrance animations (e.g. MotionSection). Provide a minimal
 * no-op stub so components that animate on scroll can render in tests.
 */
if (typeof globalThis.IntersectionObserver === "undefined") {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

/**
 * jsdom does not implement matchMedia, which the reduced-motion hook reads.
 * Provide a stub that reports "no preference" and supports event listeners.
 */
if (typeof globalThis.matchMedia === "undefined") {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof globalThis.matchMedia;
}

/**
 * jsdom does not implement ResizeObserver, which Radix UI primitives (Dialog,
 * Select, etc.) rely on. Provide a minimal no-op stub so those components can
 * mount in tests.
 */
if (typeof globalThis.ResizeObserver === "undefined") {
  class MockResizeObserver implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
}

/**
 * jsdom lacks the pointer-capture / scroll APIs that Radix UI primitives
 * (DropdownMenu, Select, Dialog) call when opening. Provide no-op stubs so
 * those interactions work under test.
 */
if (typeof Element !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}

/**
 * jsdom does not implement PointerEvent; Radix triggers open on pointer events.
 * Fall back to MouseEvent so `fireEvent.pointerDown`/click open the menus.
 */
if (typeof globalThis.PointerEvent === "undefined") {
  globalThis.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
    }
  } as unknown as typeof PointerEvent;
}
