// Page object of the card: its elements by name and the actions of the user.
import { vi } from 'vitest';
import { PASSWORD } from '../fixtures/password';
import { settle, ShadowView } from './shadow-view';
/** @import { SelectOption } from './shadow-view' */
/** @import { CardConfig, FakeHass, HeatingCurveCard } from '../fixtures/types' */

/** @typedef {'limitDay' | 'limitNight'} HeatingLimit */
/** @typedef {'outdoor' | 'flow'} PointAxis */
/** @typedef {'outdoor' | 'target' | 'actual' | 'points'} Reading */

/**
 * A new card element, not yet on the page.
 *
 * @returns {HeatingCurveCard}
 */
export const createCard = () =>
  /** @type {HeatingCurveCard} */ (document.createElement('keba-keenergy-heating-curve-card'));

/** @extends {ShadowView<HeatingCurveCard>} */
export class CardView extends ShadowView {
  /** @readonly */
  chart = new ChartView(this);

  /**
   * Adds the card to the page, sets the config and Home Assistant and waits until it is rendered.
   *
   * @param {CardConfig} config
   * @param {FakeHass} [hass]
   * @returns {Promise<CardView>}
   */
  static async create(config = {}, hass) {
    const view = new CardView(createCard());
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

  // Header and status.

  /** @returns {string | undefined} */
  get title() {
    return this.text('h2');
  }

  /**
   * The curve mode below the title.
   *
   * @returns {string | undefined}
   */
  get mode() {
    return this.text('.chart-panel header p');
  }

  /**
   * The curve table in the header.
   *
   * @returns {string | undefined}
   */
  get badge() {
    return this.text('.badge');
  }

  /** @returns {string | undefined} */
  get message() {
    return this.text('#message');
  }

  /** @returns {string | undefined} */
  get notice() {
    return this.text('.chart-panel p.notice');
  }

  /** @returns {string | undefined} */
  get legend() {
    return this.text('.legend');
  }

  /**
   * The curve name in the legend, with ` · Draft` for unsaved points.
   *
   * @returns {string | undefined}
   */
  get curveLabel() {
    return this.text('#curve-label');
  }

  /**
   * @param {Reading} key
   * @returns {string | undefined}
   */
  reading(key) {
    return this.text(`[data-live="${key}"]`);
  }

  // Controller, heating circuit and curve table.

  /** @returns {HTMLSelectElement} */
  get controllerSelect() {
    return this.get('#controller-select');
  }

  /** @returns {HTMLSelectElement} */
  get circuitSelect() {
    return this.get('#circuit-select');
  }

  /** @returns {HTMLSelectElement} */
  get curveSelect() {
    return this.get('#curve-select');
  }

  /** @returns {SelectOption[]} */
  get controllerOptions() {
    return this.options('#controller-select');
  }

  /** @returns {SelectOption[]} */
  get circuitOptions() {
    return this.options('#circuit-select');
  }

  /** @returns {SelectOption[]} */
  get curveOptions() {
    return this.options('#curve-select');
  }

  /**
   * The error of the controller and heating circuit mapping.
   *
   * @returns {string | undefined}
   */
  get mappingError() {
    return this.text('.target-error');
  }

  /**
   * The hint of the entity registry below the selects.
   *
   * @returns {string | undefined}
   */
  get registryHint() {
    return this.text('.target-panel .hint');
  }

  /** @returns {HTMLButtonElement} */
  get reloadButton() {
    return this.get('#reload-registry');
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

  /**
   * @param {string} table
   * @returns {Promise<void>}
   */
  selectCurve(table) {
    return this.change(this.curveSelect, table);
  }

  /** @returns {Promise<void>} */
  reloadRegistry() {
    return this.click(this.reloadButton);
  }

  // Heating limits.

  /**
   * @param {HeatingLimit} key
   * @returns {HTMLInputElement}
   */
  limitInput(key) {
    return this.get(`[data-setting="${key}"]`);
  }

  /** @returns {HTMLButtonElement} */
  get saveLimitsButton() {
    return this.get('#save-settings');
  }

  /**
   * @param {HeatingLimit} key
   * @param {string | number} value
   * @returns {Promise<void>}
   */
  setLimit(key, value) {
    return this.input(this.limitInput(key), value);
  }

  /** @returns {Promise<void>} */
  saveLimits() {
    return this.click(this.saveLimitsButton);
  }

  // Point table.

  /**
   * @param {number} index
   * @param {PointAxis} axis
   * @returns {HTMLInputElement}
   */
  pointInput(index, axis) {
    return this.get(`[data-point="${index}"][data-axis="${axis}"]`);
  }

  /**
   * @param {number} index
   * @returns {HTMLButtonElement}
   */
  removeButton(index) {
    return this.get(`[data-remove="${index}"]`);
  }

  /** @returns {HTMLTableRowElement[]} */
  get pointRows() {
    return this.queryAll('tbody tr');
  }

  /**
   * The values of the point table, as `[outdoor, flow]` per row.
   *
   * @returns {string[][]}
   */
  get pointValues() {
    return this.pointRows.map(row => [...row.querySelectorAll('input')].map(field => field.value));
  }

  /** @returns {HTMLElement} */
  get tableWrap() {
    return this.get('.table-wrap');
  }

  /** @returns {HTMLButtonElement} */
  get addPointButton() {
    return this.get('#add-point');
  }

  /** @returns {HTMLButtonElement} */
  get savePointsButton() {
    return this.get('#save-points');
  }

  /** @returns {HTMLButtonElement} */
  get discardButton() {
    return this.get('#reset');
  }

  /**
   * @param {number} index
   * @param {PointAxis} axis
   * @param {string | number} value
   * @returns {Promise<void>}
   */
  setPoint(index, axis, value) {
    return this.input(this.pointInput(index, axis), value);
  }

  /** @returns {Promise<void>} */
  addPoint() {
    return this.click(this.addPointButton);
  }

  /**
   * @param {number} index
   * @returns {Promise<void>}
   */
  removePoint(index) {
    return this.click(this.removeButton(index));
  }

  /** @returns {Promise<void>} */
  savePoints() {
    return this.click(this.savePointsButton);
  }

  /** @returns {Promise<void>} */
  discardDraft() {
    return this.click(this.discardButton);
  }

  // Setup hints and disabled entities.

  /**
   * The collapsible hints for missing entities and actions, `null` if everything is there.
   *
   * @returns {HTMLDetailsElement | null}
   */
  get setupHints() {
    return this.query('details');
  }

  /** @returns {string[]} */
  get missingEntities() {
    return this.texts('details li');
  }

  /** @returns {HTMLButtonElement} */
  get retryButton() {
    return this.get('#retry');
  }

  /**
   * The panel to enable disabled entities, `null` without disabled entities.
   *
   * @returns {HTMLElement | null}
   */
  get enablePanel() {
    return this.query('.setup');
  }

  /** @returns {HTMLButtonElement} */
  get enableButton() {
    return this.get('#enable-editors');
  }

  /** @returns {Promise<void>} */
  enableEntities() {
    return this.click(this.enableButton);
  }

  // Password protection.

  /**
   * The password panel, `null` without `edit_password_hash`.
   *
   * @returns {HTMLElement | null}
   */
  get lockPanel() {
    return this.query('.edit-lock');
  }

  /**
   * `Editing locked` or `Editing unlocked`.
   *
   * @returns {string | undefined}
   */
  get lockStatus() {
    return this.text('.edit-lock-info b');
  }

  /** @returns {string | undefined} */
  get lockHint() {
    return this.text('.edit-lock-info span');
  }

  /** @returns {HTMLButtonElement} */
  get unlockButton() {
    return this.get('#unlock-editor');
  }

  /** @returns {HTMLButtonElement} */
  get lockButton() {
    return this.get('#lock-editor');
  }

  /**
   * The unlock form, `null` while it is closed.
   *
   * @returns {HTMLFormElement | null}
   */
  get unlockForm() {
    return this.query('#unlock-form');
  }

  /**
   * The password field of the unlock form, `null` while it is closed.
   *
   * @returns {HTMLInputElement | null}
   */
  get passwordInput() {
    return this.query('#edit-password');
  }

  /** @returns {HTMLButtonElement} */
  get confirmUnlockButton() {
    return this.get('#confirm-unlock');
  }

  /** @returns {HTMLButtonElement} */
  get cancelUnlockButton() {
    return this.get('#cancel-unlock');
  }

  /** @returns {string | undefined} */
  get unlockError() {
    return this.text('.unlock-error');
  }

  /**
   * Opens the unlock form and enters the password without confirming it.
   *
   * @param {string} password
   * @returns {Promise<void>}
   */
  async enterPassword(password) {
    await this.click(this.unlockButton);
    /** @type {HTMLInputElement} */ (this.get('#edit-password')).value = password;
  }

  /**
   * Waits until the check of the password is done.
   *
   * @returns {Promise<void>}
   */
  async waitForPasswordCheck() {
    await vi.waitFor(() => {
      if (/** @type {HTMLButtonElement | null} */ (this.query('#confirm-unlock'))?.disabled) throw Error('Still verifying');
    }, { timeout: 10000 });
  }

  /**
   * Unlocks the editing, the card needs `PASSWORD_HASH`.
   *
   * @returns {Promise<void>}
   */
  async unlock(password = PASSWORD) {
    await this.enterPassword(password);
    await this.click(this.confirmUnlockButton);
    await this.waitForPasswordCheck();
  }

  /** @returns {Promise<void>} */
  lock() {
    return this.click(this.lockButton);
  }
}

/** The chart of the card. */
export class ChartView {
  /**
   * @type {ShadowView<HTMLElement>}
   * @private
   * @readonly
   */
  view;

  /** @param {ShadowView<HTMLElement>} view */
  constructor(view) {
    this.view = view;
  }

  /** @returns {SVGSVGElement} */
  get svg() {
    return this.view.get('svg');
  }

  /**
   * The `d` attribute of the curve.
   *
   * @returns {string}
   */
  get curvePath() {
    return this.view.get('path.curve').getAttribute('d') ?? '';
  }

  /**
   * The steps of the curve path, like `M638,201.78`.
   *
   * @returns {string[]}
   */
  get curveSteps() {
    return this.curvePath.split(' ');
  }

  /** @returns {string} */
  get clipPathId() {
    return this.view.get('clipPath').id;
  }

  /**
   * The ID of the clip path the curve uses.
   *
   * @returns {string}
   */
  get curveClipPathId() {
    return (this.view.get('path.curve').getAttribute('clip-path') ?? '').slice('url(#'.length, -1);
  }

  /**
   * The saved points.
   *
   * @returns {SVGCircleElement[]}
   */
  get points() {
    return this.view.queryAll('circle.point');
  }

  /** @returns {string[]} */
  get pointLabels() {
    return this.view.texts('.point-label');
  }

  /**
   * The `text-anchor` of the point labels.
   *
   * @returns {(string | null)[]}
   */
  get pointLabelAnchors() {
    return this.view.queryAll('.point-label').map(label => label.getAttribute('text-anchor'));
  }

  /**
   * The tooltips of the saved points, like `P1: outdoor -20.0 °C · …`.
   *
   * @returns {string[]}
   */
  get pointTitles() {
    return this.titles('P');
  }

  /**
   * The interpolated values between the points.
   *
   * @returns {SVGCircleElement[]}
   */
  get samplePoints() {
    return this.view.queryAll('.sample-point');
  }

  /** @returns {string[]} */
  get sampleLabels() {
    return this.view.texts('.sample-label');
  }

  /**
   * The outdoor temperatures of the labeled interpolated values.
   *
   * @returns {(string | undefined)[]}
   */
  get sampleOutdoors() {
    return this.view.queryAll('.sample-label').map(label => label.dataset.outdoor);
  }

  /** @returns {string[]} */
  get sampleTitles() {
    return this.titles('Interpolated');
  }

  /** @returns {string[]} */
  get flowLimitLabels() {
    return this.view.texts('.flow-limit-label');
  }

  /** @returns {SVGLineElement[]} */
  get flowLimitLines() {
    return this.view.queryAll('.limit.flow-min, .limit.flow-max');
  }

  /** @returns {string[]} */
  get heatingLimitLabels() {
    return this.view.texts('.limit-label');
  }

  /**
   * The target flow of the controller, `null` without outdoor temperature.
   *
   * @returns {SVGCircleElement | null}
   */
  get target() {
    return this.view.query('circle.target');
  }

  /** @returns {SVGCircleElement | null} */
  get actual() {
    return this.view.query('circle.actual');
  }

  /** @returns {string[]} */
  get xAxisLabels() {
    return this.view.texts('g.axes text[y="365"]');
  }

  /** @returns {string[]} */
  get yAxisLabels() {
    return this.view.texts('g.axes text[text-anchor="end"]');
  }

  /**
   * All texts of the axes: the labels and at the end the two axis titles.
   *
   * @returns {string[]}
   */
  get axisTexts() {
    return this.view.texts('g.axes text');
  }

  /** @returns {SVGLineElement[]} */
  get gridLines() {
    return this.view.queryAll('g.axes line');
  }

  /**
   * @param {string} start
   * @returns {string[]}
   * @private
   */
  titles(start) {
    return this.view.texts('g > title').filter(title => title.startsWith(start));
  }
}
