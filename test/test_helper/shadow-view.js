// Base of the page objects: finds elements in the shadow DOM and sends user events.

/**
 * Option of a select, as the user sees it.
 *
 * @typedef {object} SelectOption
 * @property {string} value
 * @property {string} label
 * @property {boolean} selected
 */

/**
 * @template {HTMLElement} T
 * @typedef {string | T} Target
 */

/**
 * Waits until the pending promises of the element are settled.
 *
 * @returns {Promise<void>}
 */
export async function settle() {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}

/** @template {HTMLElement} T */
export class ShadowView {
  /**
   * @type {T}
   * @readonly
   */
  element;

  /** @param {T} element */
  constructor(element) {
    this.element = element;
  }

  /** @returns {ShadowRoot} */
  get root() {
    if (!this.element.shadowRoot) throw Error(`${this.element.localName} has no shadow root`);
    return this.element.shadowRoot;
  }

  /**
   * The whole text of the element.
   *
   * @returns {string}
   */
  get content() {
    return this.root.textContent ?? '';
  }

  /**
   * The element of the selector, `null` if it is missing.
   *
   * @template {Element} [E=HTMLElement]
   * @param {string} selector
   * @returns {E | null}
   */
  query(selector) {
    return /** @type {E | null} */ (this.root.querySelector(selector));
  }

  /**
   * The element of the selector, fails if it is missing.
   *
   * @template {Element} [E=HTMLElement]
   * @param {string} selector
   * @returns {E}
   */
  get(selector) {
    const element = /** @type {E | null} */ (this.query(selector));
    if (!element) throw Error(`No element ${selector}`);
    return element;
  }

  /**
   * @template {Element} [E=HTMLElement]
   * @param {string} selector
   * @returns {E[]}
   */
  queryAll(selector) {
    return /** @type {E[]} */ ([...this.root.querySelectorAll(selector)]);
  }

  /**
   * The trimmed text of the element, `undefined` if it is missing.
   *
   * @param {string} selector
   * @returns {string | undefined}
   */
  text(selector) {
    return this.query(selector)?.textContent?.trim();
  }

  /**
   * @param {string} selector
   * @returns {string[]}
   */
  texts(selector) {
    return this.queryAll(selector).map(element => element.textContent ?? '');
  }

  /**
   * @param {string} selector
   * @returns {SelectOption[]}
   */
  options(selector) {
    return /** @type {HTMLOptionElement[]} */ (this.queryAll(`${selector} option`))
      .map(option => ({ value: option.value, label: option.textContent ?? '', selected: option.selected }));
  }

  /**
   * @param {Target<HTMLElement>} target
   * @returns {Promise<void>}
   */
  async click(target) {
    this.resolve(target).click();
    await settle();
  }

  /**
   * Sends a click event, also to a disabled button.
   *
   * @param {Target<HTMLElement>} target
   * @returns {Promise<void>}
   */
  async forceClick(target) {
    await this.dispatch(target, new Event('click'));
  }

  /**
   * Types a value, like the user does in a field.
   *
   * @param {Target<HTMLInputElement>} target
   * @param {string | number} value
   * @returns {Promise<void>}
   */
  async input(target, value) {
    const field = this.resolve(target);
    field.value = String(value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  }

  /**
   * Chooses a value, like the user does in a select or when leaving a field.
   *
   * @param {Target<HTMLInputElement | HTMLSelectElement>} target
   * @param {string | number} value
   * @returns {Promise<void>}
   */
  async change(target, value) {
    const field = this.resolve(target);
    field.value = String(value);
    field.dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
  }

  /**
   * @param {Target<HTMLElement>} target
   * @param {Event} event
   * @returns {Promise<void>}
   */
  async dispatch(target, event) {
    this.resolve(target).dispatchEvent(event);
    await settle();
  }

  /**
   * @template {HTMLElement} E
   * @param {Target<E>} target
   * @returns {E}
   * @private
   */
  resolve(target) {
    return typeof target === 'string' ? this.get(target) : target;
  }
}
