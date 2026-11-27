// Page object of the card: its elements by name and the actions of the user.
import { vi } from 'vitest';
import { PASSWORD } from '../fixtures/password';
import { settle, ShadowView } from './shadow-view';
/** @import { SelectOption } from './shadow-view' */
/** @import { CardConfig, FakeHass, FormSchema, HeatingCurveCard } from '../fixtures/types' */

/** @typedef {'limitDay' | 'limitNight'} HeatingLimit */
/** @typedef {'controller' | 'circuit'} TargetKind */
/** @typedef {TargetKind | 'curve' | 'limits'} CardFormId */
/**
 * A form with the label and help text functions of the card.
 *
 * @typedef {TargetForm & { computeLabel: LabelOf, computeHelper: LabelOf }} LabeledForm
 */
/** @typedef {(item: FormSchema) => string} LabelOf */

/**
 * The items of a schema and their nested items.
 *
 * @param {FormSchema[]} schema
 * @returns {FormSchema[]}
 */
const allItems = schema => schema.flatMap(item => [item, ...allItems(item.schema ?? [])]);
/** @typedef {HTMLElement & { data: Record<string, unknown>, schema: FormSchema[], hass?: unknown }} TargetForm */
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
    return this.text('.curve-mode');
  }

  /**
   * The curve table below the title.
   *
   * @returns {string | undefined}
   */
  get curveTable() {
    return this.text('.curve-table');
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

  /**
   * Whether a reading has no value, the tile shows `Unavailable` or `Unknown`.
   *
   * @param {Reading} key
   * @returns {boolean}
   */
  readingMissing(key) {
    return !!this.get(`[data-live="${key}"]`).parentElement?.classList.contains('missing');
  }

  // Controller, heating circuit and curve table.

  /**
   * A `ha-form` of the card.
   *
   * @param {CardFormId} id
   * @returns {TargetForm}
   */
  cardForm(id) {
    return this.get(`#${id}-form`);
  }

  /**
   * The schema item of a field of a form.
   *
   * @param {CardFormId} id
   * @param {string} name
   * @returns {FormSchema}
   */
  formField(id, name) {
    return /** @type {FormSchema} */ (allItems(this.cardForm(id).schema).find(item => item.name === name));
  }

  /**
   * The options of a select field with the selected one.
   *
   * @param {CardFormId} id
   * @param {string} name
   * @returns {SelectOption[]}
   */
  formOptions(id, name) {
    const value = this.cardForm(id).data[name];
    return (this.formField(id, name).selector?.select?.options ?? [])
      .map(option => ({ value: option.value, label: option.label, selected: option.value === value }));
  }

  /**
   * Changes a field like the user, `ha-form` sends all its values.
   *
   * @param {CardFormId} id
   * @param {string} name
   * @param {unknown} value
   * @returns {Promise<void>}
   */
  async setFormField(id, name, value) {
    const form = this.cardForm(id);
    form.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { ...form.data, [name]: value } } }));
    await settle();
  }

  /**
   * The `ha-form` of the controller or the heating circuit.
   *
   * @param {TargetKind} kind
   * @returns {TargetForm}
   */
  targetForm(kind) {
    return this.cardForm(kind);
  }

  /**
   * The options of the controller or the heating circuit.
   *
   * @param {TargetKind} kind
   * @returns {SelectOption[]}
   */
  targetOptions(kind) {
    return this.formOptions(kind, kind);
  }

  /**
   * Whether the user can not change the controller or the heating circuit.
   *
   * @param {TargetKind} kind
   * @returns {boolean}
   */
  targetDisabled(kind) {
    return !!this.formField(kind, kind).disabled;
  }

  /**
   * The shown controller or heating circuit.
   *
   * @param {TargetKind} kind
   * @returns {string}
   */
  targetValue(kind) {
    return String(this.cardForm(kind).data[kind]);
  }

  /**
   * The label of the form of the controller or the heating circuit.
   *
   * @param {TargetKind} kind
   * @returns {string}
   */
  targetLabel(kind) {
    const form = /** @type {LabeledForm} */ (this.cardForm(kind));
    return form.computeLabel(form.schema[0]);
  }

  /** @returns {SelectOption[]} */
  get controllerOptions() {
    return this.targetOptions('controller');
  }

  /** @returns {SelectOption[]} */
  get circuitOptions() {
    return this.targetOptions('circuit');
  }

  /** @returns {SelectOption[]} */
  get curveOptions() {
    return this.formOptions('curve', 'curve');
  }

  /** @returns {boolean} Whether the curve table can not be chosen. */
  get curveDisabled() {
    return !!this.formField('curve', 'curve').disabled;
  }

  /**
   * The label and the help text of the curve table selection.
   *
   * @returns {{ label: string, helper: string }}
   */
  get curveTexts() {
    const form = /** @type {LabeledForm} */ (this.cardForm('curve'));
    const field = this.formField('curve', 'curve');
    return { label: form.computeLabel(field), helper: form.computeHelper(field) };
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

  /** @returns {HTMLElement} */
  get reloadButton() {
    return this.get('#reload-registry');
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  selectController(id) {
    return this.selectTarget('controller', id);
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  selectCircuit(id) {
    return this.selectTarget('circuit', id);
  }

  /**
   * Chooses a controller or a heating circuit like the user, `ha-form` sends its values.
   *
   * @param {TargetKind} kind
   * @param {string} id
   * @returns {Promise<void>}
   */
  selectTarget(kind, id) {
    return this.setFormField(kind, kind, id);
  }

  /**
   * @param {string} table
   * @returns {Promise<void>}
   */
  selectCurve(table) {
    return this.setFormField('curve', 'curve', table);
  }

  /** @returns {Promise<void>} */
  reloadRegistry() {
    return this.click(this.reloadButton);
  }

  // Heating limits.

  /**
   * The shown value of a heating limit, `undefined` when unknown.
   *
   * @param {HeatingLimit} key
   * @returns {unknown}
   */
  limitValue(key) {
    return this.cardForm('limits').data[key];
  }

  /**
   * The field of a heating limit with its label, range and step.
   *
   * @param {HeatingLimit} key
   * @returns {FormSchema}
   */
  limitField(key) {
    return this.formField('limits', key);
  }

  /** @returns {HTMLElement} */
  get saveLimitsButton() {
    return this.get('#save-settings');
  }

  /** @returns {boolean} Whether the button to save the heating limits is disabled. */
  get saveLimitsDisabled() {
    return this.saveLimitsButton.hasAttribute('disabled');
  }

  /**
   * Types a heating limit like the user, an empty field sends `undefined`.
   *
   * @param {HeatingLimit} key
   * @param {string | number} value
   * @returns {Promise<void>}
   */
  setLimit(key, value) {
    return this.setFormField('limits', key, value === '' ? undefined : Number(value));
  }

  /** @returns {Promise<void>} */
  saveLimits() {
    return this.click(this.saveLimitsButton);
  }

  // Point table.

  /**
   * The `ha-form` of a point.
   *
   * @param {number} index
   * @returns {TargetForm}
   */
  pointForm(index) {
    return this.get(`ha-form[data-point="${index}"]`);
  }

  /**
   * The input of a field of a point, the fake `ha-form` renders it like Home Assistant.
   *
   * @param {number} index
   * @param {PointAxis} axis
   * @returns {HTMLInputElement}
   */
  pointInput(index, axis) {
    const input = this.pointForm(index).shadowRoot?.querySelector(`input[name="${axis}"]`);
    if (!input) throw Error(`No input ${axis} of point ${index}`);
    return /** @type {HTMLInputElement} */ (input);
  }

  /**
   * The schema item of a field of a point, with its label and range.
   *
   * @param {number} index
   * @param {PointAxis} axis
   * @returns {FormSchema}
   */
  pointField(index, axis) {
    return /** @type {FormSchema} */ (allItems(this.pointForm(index).schema).find(item => item.name === axis));
  }

  /**
   * @param {number} index
   * @returns {HTMLButtonElement}
   */
  removeButton(index) {
    return this.get(`[data-remove="${index}"]`);
  }

  /** @returns {HTMLElement[]} */
  get pointRows() {
    return this.queryAll('.point-row');
  }

  /**
   * The values of the point table, as `[outdoor, flow]` per row.
   *
   * @returns {string[][]}
   */
  get pointValues() {
    return this.queryAll('ha-form[data-point]')
      .map(form => [/** @type {TargetForm} */ (form).data.outdoor, /** @type {TargetForm} */ (form).data.flow]
        .map(value => value === undefined ? '' : String(value)));
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
  async setPoint(index, axis, value) {
    const form = this.pointForm(index);
    const number = value === '' ? undefined : Number(value);
    form.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { ...form.data, [axis]: number } } }));
    await settle();
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
   * @returns {HTMLElement | null}
   */
  get setupHints() {
    return this.query('#setup-details');
  }

  /** @returns {string[]} */
  get missingEntities() {
    return this.texts('#setup-details li');
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
    return this.view.texts('g.axes text.x-tick');
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

  /**
   * SVG units per pixel, 1 until the card knows the rendered width of the chart.
   *
   * @returns {string}
   */
  get textScale() {
    return this.svg.style.getPropertyValue('--chart-scale');
  }

  /**
   * The height of the `viewBox` in SVG units.
   *
   * @returns {number}
   */
  get height() {
    return Number(this.svg.getAttribute('viewBox')?.split(' ')[3]);
  }

  /**
   * The rendered height of the title of the outdoor axis in pixels, the flow title is rotated.
   *
   * @returns {number}
   */
  get axisTitleHeight() {
    return this.view.queryAll('g.axes text').at(-2)?.getBoundingClientRect().height ?? 0;
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
