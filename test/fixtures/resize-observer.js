// Fake ResizeObserver, jsdom has none and renders no sizes.
import { vi } from 'vitest';

/** Callbacks of the observers on the page. @type {Set<() => void>} */
const observers = new Set();

/** Fake of the browser ResizeObserver, `resizeTo()` calls the callbacks of the observed elements. */
export class FakeResizeObserver {
  /** @param {() => void} callback */
  constructor(callback) {
    this.callback = callback;
  }

  /** Starts observing, like the browser without an initial call. */
  observe() {
    observers.add(this.callback);
  }

  /** Stops observing. */
  disconnect() {
    observers.delete(this.callback);
  }
}

/**
 * Installs the fake as `ResizeObserver`, before the card is created.
 *
 * @returns {void}
 */
export function installResizeObserver() {
  observers.clear();
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
}

/**
 * Gives every element the rendered width, without calling the observers.
 *
 * @param {number} width Width in pixels.
 * @returns {void}
 */
export function setRenderedWidth(width) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(/** @type {DOMRect} */ ({ width, height: width }));
}

/**
 * Gives every element the rendered width and calls the observers, like the browser after a resize.
 *
 * @param {number} width Width in pixels.
 * @returns {void}
 */
export function resizeTo(width) {
  setRenderedWidth(width);
  for (const callback of observers) callback();
}

/** @returns {number} Number of the observers on the page. */
export const observerCount = () => observers.size;
