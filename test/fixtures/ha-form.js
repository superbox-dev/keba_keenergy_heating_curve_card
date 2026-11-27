// Fake `ha-form` of the Home Assistant frontend, jsdom and the test browser have none.
/** @import { FakeHass, FormSchema } from './types' */

/** Keeps the properties that the editor sets, the page object reads them and sends `value-changed`. */
export class FakeHaForm extends HTMLElement {
  /** @type {Partial<FakeHass> | undefined} */
  hass = undefined;

  /** @type {Record<string, unknown>} */
  data = {};

  /** @type {FormSchema[]} */
  schema = [];

  /** @type {(schema: FormSchema) => string} */
  computeLabel = schema => schema.name;
}

/**
 * Defines the fake as `ha-form`, like Home Assistant after loading the forms.
 *
 * @returns {void}
 */
export function defineHaForm() {
  if (!customElements.get('ha-form')) customElements.define('ha-form', FakeHaForm);
}
