// Page object of the visual card editor: its fields by name and the actions of the user.
import { expect, vi } from 'vitest';
import { settle, ShadowView } from './shadow-view';
import type { SelectOption } from './shadow-view';
import type { CardConfig, FakeHass, HeatingCurveCardEditor } from '../fixtures/types';

/** A field of the editor with `data-config`. */
export type ConfigField =
  | 'title'
  | 'flow_min'
  | 'flow_max'
  | 'x_min'
  | 'x_max'
  | 'x_step'
  | 'y_step'
  | 'intermediate_step';

export class EditorView extends ShadowView<HeatingCurveCardEditor> {
  /** Adds the editor to the page, sets the config and Home Assistant and waits until it is rendered. */
  static async create(config: CardConfig = {}, hass?: FakeHass): Promise<EditorView> {
    const view = new EditorView(document.createElement('keba-keenergy-heating-curve-card-editor'));
    document.body.append(view.element);
    view.element.setConfig(config);
    if (hass) view.element.hass = hass;
    await settle();
    return view;
  }

  /** Sends a new hass object, like Home Assistant on every state change. */
  set hass(hass: Partial<FakeHass>) {
    this.element.hass = hass;
  }

  setConfig(config: CardConfig): void {
    this.element.setConfig(config);
  }

  /**
   * Collects the configs of the `config-changed` events, the dashboard saves them.
   *
   * @returns The list of configs, it grows with every event.
   */
  collectConfigs(): CardConfig[] {
    const configs: CardConfig[] = [];
    this.element.addEventListener('config-changed', (event) => {
      expect(event.bubbles && event.composed).toBe(true);
      configs.push((event as CustomEvent<{ config: CardConfig }>).detail.config);
    });
    return configs;
  }

  // Fields.

  field(name: ConfigField): HTMLInputElement {
    return this.get(`[data-config="${name}"]`);
  }

  get languageSelect(): HTMLSelectElement {
    return this.get('#config-language');
  }

  get controllerSelect(): HTMLSelectElement {
    return this.get('#config-controller');
  }

  get circuitSelect(): HTMLSelectElement {
    return this.get('#config-circuit');
  }

  get languageOptions(): SelectOption[] {
    return this.options('#config-language');
  }

  get controllerOptions(): SelectOption[] {
    return this.options('#config-controller');
  }

  get circuitOptions(): SelectOption[] {
    return this.options('#config-circuit');
  }

  /** The collapsible section of the chart axes. */
  get chartAxes(): HTMLDetailsElement {
    return this.get('#chart-axes');
  }

  /** The heading of the first collapsible section. */
  get summary(): string | undefined {
    return this.text('summary');
  }

  setField(name: ConfigField, value: string | number): Promise<void> {
    return this.change(this.field(name), value);
  }

  selectLanguage(language: string): Promise<void> {
    return this.change(this.languageSelect, language);
  }

  selectController(id: string): Promise<void> {
    return this.change(this.controllerSelect, id);
  }

  selectCircuit(id: string): Promise<void> {
    return this.change(this.circuitSelect, id);
  }

  // Password protection.

  /** `Password protection · configured` or `Password protection · optional`. */
  get passwordSummary(): string | undefined {
    return this.text('details:nth-of-type(3) summary');
  }

  get newPasswordInput(): HTMLInputElement {
    return this.get('#new-password');
  }

  get repeatPasswordInput(): HTMLInputElement {
    return this.get('#repeat-password');
  }

  get createPasswordButton(): HTMLButtonElement {
    return this.get('#create-password');
  }

  /** The button to remove the password, `null` without password. */
  get removePasswordButton(): HTMLButtonElement | null {
    return this.query('#remove-password');
  }

  get passwordMessage(): HTMLElement {
    return this.get('#password-message');
  }

  /** Enters the password twice and starts hashing, without waiting for the result. */
  startPassword(password: string, repeated = password): void {
    this.newPasswordInput.value = password;
    this.repeatPasswordInput.value = repeated;
    this.createPasswordButton.click();
  }

  /** Waits until the password is hashed. */
  async waitForPassword(button = this.createPasswordButton): Promise<void> {
    await vi.waitFor(() => {
      if (button.disabled) throw Error('Still hashing');
    }, { timeout: 10000 });
  }

  /** Sets a password and waits until it is hashed. */
  async setPassword(password: string, repeated = password): Promise<void> {
    this.startPassword(password, repeated);
    await this.waitForPassword();
  }
}
