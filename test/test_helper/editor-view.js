// Page object of the visual card editor: its fields by name and the actions of the user.
import { expect, vi } from 'vitest';
import { settle, ShadowView } from './shadow-view';
/** @import { SelectOption } from './shadow-view' */
/** @import { CardConfig, FakeHass, HeatingCurveCardEditor } from '../fixtures/types' */

/**
 * A field of the editor with `data-config`.
 *
 * @typedef {'title' | 'flow_min' | 'flow_max' | 'x_min' | 'x_max' | 'x_step' | 'y_step'
 *   | 'intermediate_step'} ConfigField
 */

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

  /**
   * @param {ConfigField} name
   * @returns {HTMLInputElement}
   */
  field(name) {
    return this.get(`[data-config="${name}"]`);
  }

  /** @returns {HTMLSelectElement} */
  get languageSelect() {
    return this.get('#config-language');
  }

  /** @returns {HTMLSelectElement} */
  get controllerSelect() {
    return this.get('#config-controller');
  }

  /** @returns {HTMLSelectElement} */
  get circuitSelect() {
    return this.get('#config-circuit');
  }

  /** @returns {SelectOption[]} */
  get languageOptions() {
    return this.options('#config-language');
  }

  /** @returns {SelectOption[]} */
  get controllerOptions() {
    return this.options('#config-controller');
  }

  /** @returns {SelectOption[]} */
  get circuitOptions() {
    return this.options('#config-circuit');
  }

  /**
   * The collapsible section of the chart axes.
   *
   * @returns {HTMLDetailsElement}
   */
  get chartAxes() {
    return this.get('#chart-axes');
  }

  /**
   * The heading of the first collapsible section.
   *
   * @returns {string | undefined}
   */
  get summary() {
    return this.text('summary');
  }

  /**
   * @param {ConfigField} name
   * @param {string | number} value
   * @returns {Promise<void>}
   */
  setField(name, value) {
    return this.change(this.field(name), value);
  }

  /**
   * @param {string} language
   * @returns {Promise<void>}
   */
  selectLanguage(language) {
    return this.change(this.languageSelect, language);
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  selectController(id) {
    return this.change(this.controllerSelect, id);
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  selectCircuit(id) {
    return this.change(this.circuitSelect, id);
  }

  // Password protection.

  /**
   * `Password protection · configured` or `Password protection · optional`.
   *
   * @returns {string | undefined}
   */
  get passwordSummary() {
    return this.text('details:nth-of-type(3) summary');
  }

  /** @returns {HTMLInputElement} */
  get newPasswordInput() {
    return this.get('#new-password');
  }

  /** @returns {HTMLInputElement} */
  get repeatPasswordInput() {
    return this.get('#repeat-password');
  }

  /** @returns {HTMLButtonElement} */
  get createPasswordButton() {
    return this.get('#create-password');
  }

  /**
   * The button to remove the password, `null` without password.
   *
   * @returns {HTMLButtonElement | null}
   */
  get removePasswordButton() {
    return this.query('#remove-password');
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
    this.newPasswordInput.value = password;
    this.repeatPasswordInput.value = repeated;
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
