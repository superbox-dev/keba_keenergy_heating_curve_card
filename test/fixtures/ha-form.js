// Fake elements of the Home Assistant frontend, jsdom and the test browser have none.
import { vi } from 'vitest';
/** @import { FakeHass, FormSchema } from './types' */

/**
 * The fields of a schema, without the sections and grids around them.
 *
 * @param {FormSchema[]} schema
 * @returns {FormSchema[]}
 */
const fields = schema => schema.flatMap(item => item.schema ? fields(item.schema) : [item]);

/**
 * Keeps the properties that the card and the editor set, the page objects read them and send `value-changed`.
 *
 * Number fields are real inputs, like `ha-selector-number`, so the browser tests can type into them.
 */
export class FakeHaForm extends HTMLElement {
  /** @type {Partial<FakeHass> | undefined} */
  hass = undefined;

  /** @type {(schema: FormSchema) => string} */
  computeLabel = schema => schema.name;

  /** @type {FormSchema[]} */
  #schema = [];

  /** @type {Record<string, unknown>} */
  #data = {};

  /** @returns {FormSchema[]} */
  get schema() {
    return this.#schema;
  }

  /** @param {FormSchema[]} schema */
  set schema(schema) {
    this.#schema = schema;
    const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    root.replaceChildren(...fields(schema).filter(item => item.selector?.number).map((item) => {
      const input = document.createElement('input');
      Object.assign(input, { type: 'number', name: item.name, disabled: !!item.disabled });
      input.addEventListener('input', () => this.dispatchEvent(new CustomEvent('value-changed', {
        detail: { value: { ...this.#data, [item.name]: input.value === '' ? undefined : Number(input.value) } },
      })));
      return input;
    }));
    this.#showData();
  }

  /** @returns {Record<string, unknown>} */
  get data() {
    return this.#data;
  }

  /** @param {Record<string, unknown>} data */
  set data(data) {
    this.#data = data;
    this.#showData();
  }

  /** Shows the values in the inputs, a focused input keeps what the user types. */
  #showData() {
    for (const input of this.shadowRoot?.querySelectorAll('input') ?? []) {
      if (this.shadowRoot?.activeElement !== input) input.value = String(this.#data[input.name] ?? '');
    }
  }
}

/** A button of Home Assistant with the `disabled` property of `ha-button` and `ha-icon-button`. */
export class FakeHaButton extends HTMLElement {
  /** @returns {boolean} */
  get disabled() {
    return this.hasAttribute('disabled');
  }

  /** @param {boolean} disabled */
  set disabled(disabled) {
    this.toggleAttribute('disabled', disabled);
  }
}

/**
 * Defines the fakes as `ha-form`, `ha-button` and `ha-icon-button`, like Home Assistant after loading the forms.
 *
 * @returns {void}
 */
export function defineHaForm() {
  if (!customElements.get('ha-form')) customElements.define('ha-form', FakeHaForm);
  if (!customElements.get('ha-button')) customElements.define('ha-button', FakeHaButton);
  if (!customElements.get('ha-icon-button')) customElements.define('ha-icon-button', class extends FakeHaButton {});
}

/**
 * Hides `ha-form` from the card, like a dashboard before Home Assistant has loaded its forms.
 *
 * @returns {void}
 */
export function withoutHaForm() {
  const get = customElements.get.bind(customElements);
  vi.spyOn(customElements, 'get').mockImplementation(name => name === 'ha-form' ? undefined : get(name));
}
