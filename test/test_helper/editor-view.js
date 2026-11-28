// Page object of the visual card editor: its fields by name and the actions of the user.
import { expect, vi } from 'vitest';
import { settle, ShadowView } from './shadow-view';
/** @import { SelectOption } from './shadow-view' */
/** @import { CardConfig, FakeHass, FormSchema, HeatingCurveCardEditor } from '../fixtures/types' */

/**
 * An option of the editor or a password field, a field of one of its forms.
 *
 * @typedef {'title' | 'language' | 'config_entry' | 'circuit' | 'flow_min' | 'flow_max' | 'x_min' | 'x_max'
 *   | 'x_step' | 'y_min' | 'y_max' | 'y_step' | 'intermediate_step' | 'auto_lock_minutes' | 'new_password'
 *   | 'repeat_password'} ConfigField
 */

/**
 * The fake `ha-form` with its properties.
 *
 * @typedef {HTMLElement & {
 *   hass?: Partial<FakeHass>,
 *   data: Record<string, unknown>,
 *   schema: FormSchema[],
 *   computeLabel: (schema: FormSchema) => string,
 *   computeHelper: (schema: FormSchema) => string | undefined,
 * }} Form
 */

/**
 * The `ha-expansion-panel` with its header.
 *
 * @typedef {HTMLElement & { header: string, secondary: string }} Panel
 */

/**
 * The items of a schema and their nested items.
 *
 * @param {FormSchema[]} schema
 * @returns {FormSchema[]}
 */
const allItems = schema => schema.flatMap(item => [item, ...allItems(item.schema ?? [])]);

/**
 * A new editor element, not yet on the page.
 *
 * @returns {HeatingCurveCardEditor}
 */
export const createEditor = () =>
  /** @type {HeatingCurveCardEditor} */ (document.createElement('keba-keenergy-heating-curve-card-editor'));

/** @extends {ShadowView<HeatingCurveCardEditor>} */
export class EditorView extends ShadowView {
  /**
   * Adds the editor to the page, sets the config and Home Assistant and waits until it is rendered.
   *
   * @param {CardConfig} config
   * @param {FakeHass} [hass]
   * @returns {Promise<EditorView>}
   */
  static async create(config = {}, hass) {
    const view = new EditorView(createEditor());
    document.body.append(view.element);
    view.element.setConfig(config);
    if (hass) view.element.hass = hass;
    await settle();
    return view;
  }

  /**
   * Sends a new hass object, like Home Assistant on every state change.
   *
   * @param {Partial<FakeHass>} hass
   */
  set hass(hass) {
    this.element.hass = hass;
  }

  /**
   * @param {CardConfig} config
   * @returns {void}
   */
  setConfig(config) {
    this.element.setConfig(config);
  }

  /**
   * Collects the configs of the `config-changed` events, the dashboard saves them.
   *
   * @returns {CardConfig[]} The list of configs, it grows with every event.
   */
  collectConfigs() {
    /** @type {CardConfig[]} */
    const configs = [];
    this.element.addEventListener('config-changed', (event) => {
      expect(event.bubbles && event.composed).toBe(true);
      configs.push((/** @type {CustomEvent<{ config: CardConfig }>} */ (event)).detail.config);
    });
    return configs;
  }

  // Fields.

  /** @returns {Form[]} */
  get forms() {
    return this.queryAll('ha-form');
  }

  /**
   * The form with the field.
   *
   * @param {ConfigField} name
   * @returns {Form}
   */
  form(name) {
    const form = this.forms.find(candidate => allItems(candidate.schema).some(item => item.name === name));
    if (!form) throw Error(`No field ${name}`);
    return form;
  }

  /**
   * The schema item of the field.
   *
   * @param {ConfigField} name
   * @returns {FormSchema}
   */
  field(name) {
    return /** @type {FormSchema} */ (allItems(this.form(name).schema).find(item => item.name === name));
  }

  /**
   * The value that the field shows.
   *
   * @param {ConfigField} name
   * @returns {unknown}
   */
  value(name) {
    return this.form(name).data[name];
  }

  /**
   * The label of the field.
   *
   * @param {ConfigField} name
   * @returns {string}
   */
  label(name) {
    return this.form(name).computeLabel(this.field(name));
  }

  /**
   * The help text below the field, `undefined` without help text.
   *
   * @param {ConfigField} name
   * @returns {string | undefined}
   */
  helper(name) {
    return this.form(name).computeHelper(this.field(name));
  }

  /**
   * The bounds of a number field.
   *
   * @param {ConfigField} name
   * @returns {{ min?: number, max?: number, step: number | 'any' } | undefined}
   */
  bounds(name) {
    return this.field(name).selector?.number;
  }

  /**
   * The options of a select field with the selected one.
   *
   * @param {ConfigField} name
   * @returns {SelectOption[]}
   */
  selectOptions(name) {
    const value = this.value(name);
    return (this.field(name).selector?.select?.options ?? [])
      .map(option => ({ value: option.value, label: option.label, selected: option.value === value }));
  }

  /** @returns {SelectOption[]} */
  get languageOptions() {
    return this.selectOptions('language');
  }

  /** @returns {SelectOption[]} */
  get controllerOptions() {
    return this.selectOptions('config_entry');
  }

  /** @returns {SelectOption[]} */
  get circuitOptions() {
    return this.selectOptions('circuit');
  }

  /**
   * The titles of the sections inside the forms.
   *
   * @returns {string[]}
   */
  get sectionTitles() {
    return this.forms.flatMap(form => allItems(form.schema)).flatMap(item => item.title ? [item.title] : []);
  }

  /**
   * The labels of the sections and grids inside the forms, they have a title or no label.
   *
   * @returns {string[]}
   */
  get sectionLabels() {
    return this.forms.flatMap(form => allItems(form.schema)
      .filter(item => item.type)
      .map(item => form.computeLabel(item)));
  }

  /**
   * The collapsible section of the chart axes.
   *
   * @returns {Panel}
   */
  get chartAxes() {
    return this.get('#chart-axes');
  }

  /**
   * The header of the section of the chart axes.
   *
   * @returns {string}
   */
  get summary() {
    return this.chartAxes.header;
  }

  /**
   * Changes a field like the user, `ha-form` sends all its values.
   *
   * @param {ConfigField} name
   * @param {unknown} value
   * @returns {Promise<void>}
   */
  async setField(name, value) {
    const form = this.form(name);
    form.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { ...form.data, [name]: value } } }));
    await settle();
  }

  /**
   * @param {string} language
   * @returns {Promise<void>}
   */
  selectLanguage(language) {
    return this.setField('language', language);
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  selectController(id) {
    return this.setField('config_entry', id);
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  selectCircuit(id) {
    return this.setField('circuit', id);
  }

  // Password protection.

  /**
   * The header of the password section and its second line, `Configured` or `Optional`.
   *
   * @returns {{ header: string, status: string }}
   */
  get passwordSummary() {
    const panel = /** @type {Panel} */ (this.get('#password'));
    return { header: panel.header, status: panel.secondary };
  }

  /**
   * The inputs of the password form, in the shadow root of its `ha-form`.
   *
   * @returns {HTMLInputElement[]}
   */
  get passwordInputs() {
    return [...this.get('#new-password').shadowRoot?.querySelectorAll('input') ?? []];
  }

  /** @returns {HTMLInputElement} */
  get newPasswordInput() {
    return this.passwordInputs[0];
  }

  /** @returns {HTMLInputElement} */
  get repeatPasswordInput() {
    return this.passwordInputs[1];
  }

  /** @returns {HTMLButtonElement} */
  get createPasswordButton() {
    return this.get('#create-password');
  }

  /**
   * The button to remove the password, `null` while it is hidden without password.
   *
   * @returns {HTMLButtonElement | null}
   */
  get removePasswordButton() {
    const button = this.get('#remove-password');
    return button.hidden ? null : /** @type {HTMLButtonElement} */ (button);
  }

  /** @returns {HTMLElement} */
  get passwordMessage() {
    return this.get('#password-message');
  }

  /**
   * Enters the password twice and starts hashing, without waiting for the result.
   *
   * @param {string} password
   * @returns {void}
   */
  startPassword(password, repeated = password) {
    for (const [input, value] of /** @type {[HTMLInputElement, string][]} */ ([
      [this.newPasswordInput, password],
      [this.repeatPasswordInput, repeated],
    ])) {
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    this.createPasswordButton.click();
  }

  /**
   * Waits until the password is hashed.
   *
   * @returns {Promise<void>}
   */
  async waitForPassword(button = this.createPasswordButton) {
    await vi.waitFor(() => {
      if (button.disabled) throw Error('Still hashing');
    }, { timeout: 10000 });
  }

  /**
   * Sets a password and waits until it is hashed.
   *
   * @param {string} password
   * @returns {Promise<void>}
   */
  async setPassword(password, repeated = password) {
    this.startPassword(password, repeated);
    await this.waitForPassword();
  }
}
