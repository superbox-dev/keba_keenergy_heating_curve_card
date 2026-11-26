// Base of the page objects: finds elements in the shadow DOM and sends user events.

/** Option of a select, as the user sees it. */
export interface SelectOption {
  value: string;
  label: string;
  selected: boolean;
}

type Target<T extends HTMLElement> = string | T;

/** Waits until the pending promises of the element are settled. */
export async function settle(): Promise<void> {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}

export class ShadowView<T extends HTMLElement> {
  constructor(readonly element: T) {}

  get root(): ShadowRoot {
    if (!this.element.shadowRoot) throw Error(`${this.element.localName} has no shadow root`);
    return this.element.shadowRoot;
  }

  /** The whole text of the element. */
  get content(): string {
    return this.root.textContent ?? '';
  }

  /** The element of the selector, `null` if it is missing. */
  query<E extends Element = HTMLElement>(selector: string): E | null {
    return this.root.querySelector<E>(selector);
  }

  /** The element of the selector, fails if it is missing. */
  get<E extends Element = HTMLElement>(selector: string): E {
    const element = this.query<E>(selector);
    if (!element) throw Error(`No element ${selector}`);
    return element;
  }

  queryAll<E extends Element = HTMLElement>(selector: string): E[] {
    return [...this.root.querySelectorAll<E>(selector)];
  }

  /** The trimmed text of the element, `undefined` if it is missing. */
  text(selector: string): string | undefined {
    return this.query(selector)?.textContent?.trim();
  }

  texts(selector: string): string[] {
    return this.queryAll(selector).map(element => element.textContent ?? '');
  }

  options(selector: string): SelectOption[] {
    return this.queryAll<HTMLOptionElement>(`${selector} option`)
      .map(option => ({ value: option.value, label: option.textContent ?? '', selected: option.selected }));
  }

  async click(target: Target<HTMLElement>): Promise<void> {
    this.resolve(target).click();
    await settle();
  }

  /** Sends a click event, also to a disabled button. */
  async forceClick(target: Target<HTMLElement>): Promise<void> {
    await this.dispatch(target, new Event('click'));
  }

  /** Types a value, like the user does in a field. */
  async input(target: Target<HTMLInputElement>, value: string | number): Promise<void> {
    const field = this.resolve(target);
    field.value = String(value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  }

  /** Chooses a value, like the user does in a select or when leaving a field. */
  async change(target: Target<HTMLInputElement | HTMLSelectElement>, value: string | number): Promise<void> {
    const field = this.resolve(target);
    field.value = String(value);
    field.dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
  }

  async dispatch(target: Target<HTMLElement>, event: Event): Promise<void> {
    this.resolve(target).dispatchEvent(event);
    await settle();
  }

  private resolve<E extends HTMLElement>(target: Target<E>): E {
    return typeof target === 'string' ? this.get<E>(target) : target;
  }
}
