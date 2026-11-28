// Page object of the card in a dashboard of Home Assistant in Docker, with Playwright.
import { chromium } from 'playwright';
/** @import { Browser, Locator, Page } from 'playwright' */
/** @import { Tokens } from '../system/dashboard' */

const CARD = 'keba-keenergy-heating-curve-card';
const EDITOR = `${CARD}-editor`;

/** The dashboard with the card and the visual editor of the card, Playwright finds elements in shadow roots. */
export class DashboardView {
  /**
   * @type {Browser}
   * @readonly
   */
  browser;

  /**
   * @type {Page}
   * @readonly
   */
  page;

  /**
   * @param {Browser} browser
   * @param {Page} page
   */
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
  }

  /**
   * Opens a dashboard view as the test user.
   *
   * @param {string} url URL of Home Assistant.
   * @param {string} path Path of the dashboard and the view.
   * @param {Tokens} tokens Tokens of the test user.
   * @returns {Promise<DashboardView>}
   */
  static async open(url, path, tokens) {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    // The frontend reads the login from localStorage, like after a login in the browser.
    await page.addInitScript(({ url, tokens }) => {
      localStorage.setItem('hassTokens', JSON.stringify({
        ...tokens,
        hassUrl: url,
        clientId: `${url}/`,
        expires: Date.now() + tokens.expires_in * 1000,
      }));
    }, { url, tokens });
    await page.goto(`${url}/${path}`);
    return new DashboardView(browser, page);
  }

  /** @returns {Promise<void>} */
  close() {
    return this.browser.close();
  }

  /** @returns {Locator} */
  get card() {
    return this.page.locator(CARD);
  }

  /**
   * The error cards of the dashboard, Home Assistant shows them for unknown cards and invalid configs.
   *
   * @returns {Locator}
   */
  get errorCards() {
    return this.page.locator('hui-error-card');
  }

  // The card.

  /**
   * The text of an element of the card.
   *
   * @param {string} selector
   * @returns {Promise<string>}
   */
  async text(selector) {
    return (await this.card.locator(selector).first().textContent() ?? '').trim();
  }

  /**
   * A reading of the card, like `5 °C`.
   *
   * @param {'outdoor' | 'target' | 'actual' | 'points'} key
   * @returns {Promise<string>}
   */
  reading(key) {
    return this.text(`[data-live="${key}"]`);
  }

  /**
   * The curve table in the pill next to the title.
   *
   * @returns {Promise<string>}
   */
  get curveTable() {
    return this.text('.curve-table');
  }

  /**
   * The shown option of a selection of the card.
   *
   * @param {'controller' | 'circuit' | 'curve'} form
   * @returns {Promise<string>}
   */
  async selected(form) {
    return (await this.card.locator(`#${form}-form ha-select`).evaluate(
      select => /** @type {{ value: string }} */ (/** @type {unknown} */ (select)).value,
    )) ?? '';
  }

  /**
   * Chooses an option of a selection of the card like the user: opens the menu and clicks the option.
   *
   * @param {'controller' | 'circuit' | 'curve'} form
   * @param {string} label Text of the option.
   * @returns {Promise<void>}
   */
  async choose(form, label) {
    // The field itself, `ha-select` also contains the help text below it.
    await this.card.locator(`#${form}-form ha-select ha-picker-field`).click();
    await this.card.locator(`#${form}-form ha-dropdown-item`, { hasText: label }).click();
  }

  /**
   * Types a heating limit into its number field like the user.
   *
   * @param {'day' | 'night'} limit
   * @param {number} value
   * @returns {Promise<void>}
   */
  async setLimit(limit, value) {
    await this.card.locator('#limits-form ha-input input').nth(limit === 'day' ? 0 : 1).fill(String(value));
  }

  /**
   * The values of the point fields, as `[outdoor, flow]` per row.
   *
   * @returns {Promise<string[][]>}
   */
  async points() {
    const rows = await this.card.locator('ha-form[data-point]').count();
    /** @type {string[][]} */
    const values = [];
    for (let index = 0; index < rows; index++) {
      values.push(await this.card.locator(`ha-form[data-point="${index}"] ha-input input`).evaluateAll(
        inputs => inputs.map(input => /** @type {HTMLInputElement} */ (input).value),
      ));
    }
    return values;
  }

  /**
   * Types into a field of a point like the user.
   *
   * @param {number} index Row of the point.
   * @param {'outdoor' | 'flow'} axis
   * @param {number} value
   * @returns {Promise<void>}
   */
  async setPoint(index, axis, value) {
    await this.card.locator(`ha-form[data-point="${index}"] ha-input input`).nth(axis === 'outdoor' ? 0 : 1)
      .fill(String(value));
  }

  /**
   * Clicks a button of the card.
   *
   * @param {'save-settings' | 'save-points' | 'add-point' | 'reset' | 'reload-registry' | 'enable-editors'
   *   | 'unlock-editor' | 'confirm-unlock'} id
   * @returns {Promise<void>}
   */
  async press(id) {
    await this.card.locator(`ha-button#${id}`).click();
  }

  /**
   * Removes a point with its delete button.
   *
   * @param {number} index Row of the point.
   * @returns {Promise<void>}
   */
  async removePoint(index) {
    await this.card.locator(`ha-icon-button[data-remove="${index}"]`).click();
  }

  /**
   * Sets a config of the card in the open page, like after saving it in the editor, the dashboard keeps its config.
   *
   * @param {object} config Options of the card, without `type`.
   * @returns {Promise<void>}
   */
  async configure(config) {
    await this.card.evaluate((card, config) => /** @type {HTMLElement & { setConfig(config: object): void }} */ (card)
      .setConfig({ type: 'custom:keba-keenergy-heating-curve-card', ...config }), config);
  }

  /**
   * The title of a notice, `ha-alert` shows it as its title.
   *
   * @param {'lock-status' | 'setup-details' | 'enable-panel'} id
   * @returns {Promise<string>}
   */
  alertTitle(id) {
    return this.card.locator(`ha-alert#${id}`).evaluate(alert => /** @type {HTMLElement} */ (alert).title);
  }

  /**
   * Whether a notice or another element of the card is shown.
   *
   * @param {string} selector
   * @returns {Promise<boolean>}
   */
  shows(selector) {
    return this.card.locator(selector).first().isVisible();
  }

  /**
   * Types the password into the unlock form like the user and confirms it.
   *
   * @param {string} password
   * @returns {Promise<void>}
   */
  async unlock(password) {
    await this.press('unlock-editor');
    await this.card.locator('#edit-password ha-input input').fill(password);
    await this.press('confirm-unlock');
  }

  /**
   * The lines of the chart with the class, like `limit.flow-min`.
   *
   * @param {string} cls
   * @returns {Locator}
   */
  chartLines(cls) {
    return this.card.locator(`svg line.${cls}`);
  }

  /**
   * The number of the columns of the chart and the settings.
   *
   * @returns {Promise<number>}
   */
  layoutColumns() {
    return this.card.locator('.layout').evaluate(layout => getComputedStyle(layout).gridTemplateColumns.split(' ').length);
  }

  /**
   * Sets the width of the browser window.
   *
   * @param {number} width
   * @returns {Promise<void>}
   */
  resize(width) {
    return this.page.setViewportSize({ width, height: 900 });
  }

  // The visual editor.

  /** @returns {Locator} */
  get editor() {
    return this.page.locator(EDITOR);
  }

  /**
   * A form of the editor.
   *
   * @param {'general' | 'axes' | 'flow' | 'lock'} id
   * @returns {Locator}
   */
  form(id) {
    return this.editor.locator(`ha-form#${id}`);
  }

  /**
   * The field selectors of a form, `ha-form` renders one per option.
   *
   * @param {'general' | 'axes' | 'flow' | 'lock'} id
   * @returns {Locator}
   */
  selectors(id) {
    return this.form(id).locator('ha-selector');
  }

  /**
   * The header of a section of the editor.
   *
   * @param {'chart-axes' | 'flow-limits' | 'password'} id
   * @returns {Promise<string>}
   */
  header(id) {
    return this.editor.locator(`ha-expansion-panel#${id}`).evaluate(panel => /** @type {{ header: string }} */ (
      /** @type {unknown} */ (panel)).header);
  }

  /**
   * Creates the editor like the card editor dialog: with `getConfigElement()`, the config and `hass`.
   *
   * @param {object} config
   * @returns {Promise<void>}
   */
  async openEditor(config) {
    await this.page.evaluate(async ({ card, config }) => {
      const cardClass = /** @type {{ getConfigElement(): Promise<HTMLElement> } | undefined} */ (
        /** @type {unknown} */ (customElements.get(card)));
      const editor = /** @type {HTMLElement & { setConfig(config: object): void, hass: unknown }} */ (
        await cardClass?.getConfigElement());
      const app = /** @type {HTMLElement & { hass: unknown }} */ (document.querySelector('home-assistant'));
      const configs = /** @type {object[]} */ ([]);
      Object.assign(window, { cardConfigs: configs });
      editor.addEventListener('config-changed', event => configs.push(
        /** @type {CustomEvent<{ config: object }>} */ (event).detail.config,
      ));
      editor.setConfig(config);
      editor.hass = app.hass;
      editor.style.cssText = 'position:fixed;inset:0 auto auto 0;width:500px;z-index:10;background:white';
      document.body.append(editor);
    }, { card: CARD, config });
    await this.form('general').locator('ha-selector').first().waitFor();
  }

  /**
   * The configs of the `config-changed` events of the editor.
   *
   * @returns {Promise<object[]>}
   */
  configs() {
    return this.page.evaluate(() => /** @type {{ cardConfigs: object[] }} */ (
      /** @type {unknown} */ (window)).cardConfigs);
  }

  /**
   * Types into a text field of a form like the user, the label of `ha-input` is in another shadow root.
   *
   * @param {'general' | 'axes' | 'flow' | 'lock'} id Form.
   * @param {number} index Position of the field in the form.
   * @param {string} value
   * @returns {Promise<void>}
   */
  async type(id, index, value) {
    await this.selectors(id).nth(index).locator('input').fill(value);
  }
}
