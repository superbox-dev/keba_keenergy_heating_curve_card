// KEBA KeEnergy Heating Curve Card: shows and edits the heating curve of a heating circuit.
import { FIELDS, discoverControllers, loadRegistry } from './discovery.js';
import { errorText, formatNumber, languageCode, translate } from './i18n.js';
import { enableEntities, saveLimits, savePoints, selectCurve } from './card/actions.js';
import { resolveBinding } from './card/binding.js';
import { CHART_WIDTH, renderChart } from './card/chart.js';
import { normalizeConfig } from './card/config.js';
import {
  LIMIT_FIELDS,
  LIMIT_KEYS,
  isAvailable,
  numberRange,
  numeric,
  temperature,
} from './card/entities.js';
import { EditLock } from './card/lock.js';
import { POINT_LIMITS, newPoint, readPoints, samePoints, sortByOutdoor } from './card/points.js';
import {
  cardTemplate,
  curveForm,
  curveLabel,
  limitsData,
  limitsForm,
  passwordForm,
  pointData,
  pointForm,
  pointRows,
  targetForms,
} from './card/templates.js';
import { loadHaForm } from './editor.js';

/**
 * @typedef {import('./discovery.js').Controller} Controller
 * @typedef {import('./discovery.js').FieldKey} FieldKey
 * @typedef {import('./types.js').DeviceRegistryEntry} DeviceRegistryEntry
 * @typedef {import('./types.js').EntityRegistryEntry} EntityRegistryEntry
 * @typedef {import('./types.js').Hass} Hass
 * @typedef {import('./types.js').HassEntity} HassEntity
 * @typedef {import('./card/config.js').CardConfig} CardConfig
 * @typedef {import('./card/entities.js').LimitKey} LimitKey
 * @typedef {import('./card/points.js').CurvePoint} CurvePoint
 * @typedef {import('./card/templates.js').CardModel} CardModel
 * @typedef {import('./card/templates.js').CardForm} CardForm
 * @typedef {import('./card/templates.js').Reading} Reading
 * @typedef {import('./types.js').Translate} Translate
 */

/**
 * A heating limit that the card sent, it shows the value until the entity changes.
 *
 * @typedef {object} SentValue
 * @property {number} value Sent value in °C.
 * @property {number} before Value of the entity when the card sent the value, in °C.
 */

/**
 * Points of a curve table that the user changed, not saved yet.
 *
 * @typedef {object} Draft
 * @property {string} name Name of the curve table.
 * @property {CurvePoint[]} points The changed points.
 * @property {boolean} [saved] Whether the points were sent and the card waits for the controller values.
 */

/** Names of the fields in the warning about missing entities, translated by `_t()`. @type {Record<FieldKey, string>} */
const FIELD_NAMES = {
  select: 'Curve table selection',
  curve: 'Curve table points',
  outdoor: 'Outdoor temperature',
  actual: 'Actual flow',
  target: 'Target flow',
  useCurve: 'Curve mode',
  limitDay: 'Day heating limit',
  limitNight: 'Night heating limit',
};

/** Path of the icon `mdi:delete-outline` of Material Design Icons, embedded like the icons of Home Assistant. */
const DELETE_ICON = 'M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z';

const CARD_TYPE = 'keba-keenergy-heating-curve-card';
const EDITOR_TYPE = 'keba-keenergy-heating-curve-card-editor';

/** Number of cards on the page, for unique SVG IDs. */
let cardSequence = 0;

export class KeEnergyHeatingCurveCard extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    this._root = root;
    /**
     * `_t()` as a function of its own, for the templates and the helpers.
     *
     * @type {Translate}
     */
    this._translate = (text, params) => this._t(text, params);
    /** @type {CardConfig | undefined} */
    this._config = undefined;
    /** @type {Hass | undefined} */
    this._hass = undefined;
    this._lock = new EditLock({
      t: this._translate,
      render: force => this._render(force),
      passwordForm: () => this._root.querySelector('#edit-password'),
      onLocked: message => this._discardChanges(message),
      onUnlocked: (message) => {
        this._message = message;
      },
    });
    /** Unsaved heating limits by field, in °C. @type {Partial<Record<LimitKey, number>>} */
    this._edits = {};
    /** Sent heating limits by entity, shown until the entity changes. @type {Record<string, SentValue>} */
    this._sent = {};
    /** @type {Draft | null} */
    this._draft = null;
    /** SVG units per pixel of the chart, measured after rendering. */
    this._textScale = 1;
    // The selection of the controller and the heating circuit is a form of Home Assistant, Lit keeps the properties
    // that the card sets before the element is defined.
    loadHaForm().catch(() => undefined);
    /** Keeps the texts of the chart at their size in pixels when the card changes its width. */
    this._resizeObserver = globalThis.ResizeObserver ? new ResizeObserver(() => this._scaleChart()) : undefined;
    /** Whether an action is running. */
    this._busy = false;
    /** Status message. */
    this._message = '';
    /** Discovered entity IDs of the shown heating circuit. @type {Partial<Record<FieldKey, string>>} */
    this._map = {};
    /** @type {EntityRegistryEntry[]} */
    this._registry = [];
    /** @type {DeviceRegistryEntry[]} */
    this._devices = [];
    /** Whether a redraw waits until the user stops editing. */
    this._pendingRender = false;
    /** Whether the user is in a form of the card, its menu or field stays while the card updates. */
    this._formFocused = false;
    /** Key of the shown view, a full redraw only when it changes. @type {string | null} */
    this._viewKey = null;
    /** Key of the view without the points, the point table is patched when only they change. */
    this._shellKey = '';
    this._plotId = 'keenergy-plot-' + (++cardSequence);
    /** Counter that makes running discoveries of an older config obsolete. */
    this._discoveryRevision = 0;
    this._discovered = false;
    this._discovering = false;
    /** @type {Controller[]} */
    this._controllers = [];
    this._controllerId = '';
    this._circuitId = '';
    /** @type {string | null} */
    this._entryId = null;
    this._bindingError = '';
    /** Error of loading the registry, empty without error. */
    this._registryError = '';
    /** Curve table that the card assigned and waits for. @type {string | null} */
    this._loadingCurve = null;
    this._visibilityHandler = () => {
      if (this._lock.enabled && globalThis.document?.hidden) this._lockEditing();
    };
    const flush = () => queueMicrotask(() => {
      if (this._pendingRender && !this._editing()) this._render();
    });
    root.addEventListener('focusout', (event) => {
      // A button click must reach its handler before a pending redraw replaces that button.
      const target = /** @type {Element | null} */ (/** @type {FocusEvent} */ (event).relatedTarget);
      if (target && root.contains(target) && target.matches('button, ha-button')) return;
      flush();
    });
    root.addEventListener('click', flush);
  }

  /**
   * Sets the card config, called by Home Assistant.
   *
   * @param {Record<string, unknown>} config Card config as the user wrote it.
   * @throws {Error} When an option is invalid.
   */
  setConfig(config) {
    const { config: normalized, verifier } = normalizeConfig(config, this._hass);
    this._config = normalized;
    this._lock.configure(verifier, normalized.auto_lock_minutes);
    this._discoveryRevision++;
    this._controllers = [];
    this._registry = [];
    this._controllerId = '';
    this._circuitId = '';
    this._bindingError = '';
    this._registryError = '';
    this._map = {};
    this._entryId = normalized.config_entry || null;
    this._discovered = false;
    this._discovering = false;
    this._message = '';
    this._draft = null;
    this._edits = {};
    this._loadingCurve = null;
    this._pendingRender = false;
    this._formFocused = false;
    this._viewKey = null;
    this._render(true);
    this._discover();
  }

  /**
   * Sets the `hass` object, called by Home Assistant on every state change.
   *
   * @param {Hass} hass The `hass` object.
   */
  set hass(hass) {
    const oldLanguage = languageCode(this._config, this._hass);
    this._hass = hass;
    if (oldLanguage !== languageCode(this._config, hass)) {
      this._message = '';
      this._lock.error = '';
      if (this._registry.length) {
        this._controllers = discoverControllers(this._registry, this._devices, this._translate);
        this._applySelection();
      }
    }
    if (this._loadingCurve && !this._busy) {
      const ids = this._ids();
      if (this._state(ids.curve)?.state === this._loadingCurve
        && this._state(ids.select)?.state === this._loadingCurve) {
        this._loadingCurve = null;
      }
    }
    if (this._draft?.saved && this._draft.name === this._selected()
      && samePoints(this._draft.points, sortByOutdoor(this._readPoints()))) {
      this._draft = null;
    }
    this._render();
    this._discover();
  }

  /** @returns {number} Height of the card in rows of 50 px, for the masonry view. */
  getCardSize() {
    return 11;
  }

  /** @returns {{ columns: string, min_columns: number }} Size of the card in the sections view. */
  getGridOptions() {
    return { columns: 'full', min_columns: 6 };
  }

  /** @returns {Record<string, unknown>} Config of a new card in the card picker. */
  static getStubConfig() {
    return {};
  }

  /** @returns {Promise<HTMLElement>} The visual card editor, after Home Assistant has loaded its forms. */
  static async getConfigElement() {
    await loadHaForm();
    return document.createElement(EDITOR_TYPE);
  }

  /** Locks when the page is hidden, while the card is on the page. */
  connectedCallback() {
    globalThis.document?.addEventListener('visibilitychange', this._visibilityHandler);
    this._resizeObserver?.observe(this);
  }

  /** Locks when the card leaves the page, the unsaved changes are discarded. */
  disconnectedCallback() {
    globalThis.document?.removeEventListener('visibilitychange', this._visibilityHandler);
    this._resizeObserver?.disconnect();
    if (this._lock.enabled) this._lockEditing();
  }

  /**
   * Translates an English source text into the language of the card.
   *
   * @param {string} text English source text.
   * @param {Record<string, unknown>} [params] Values of the placeholders.
   * @returns {string} The translated text.
   */
  _t(text, params) {
    return translate(languageCode(this._config, this._hass), text, params);
  }

  /**
   * Formats a number in the number format of the user.
   *
   * @param {number} value The number.
   * @param {Intl.NumberFormatOptions} [options] Format options.
   * @returns {string} The formatted number.
   */
  _number(value, options) {
    return formatNumber(value, this._config, this._hass, options);
  }

  /**
   * Formats a temperature in °C.
   *
   * @param {number} value Temperature in °C.
   * @returns {string} The temperature with unit, the callers show a missing value themselves.
   */
  _fmt(value) {
    return this._number(value) + ' °C';
  }

  /**
   * The current `hass` object for the actions, Home Assistant replaces it on every state change.
   *
   * @returns {Hass} The `hass` object, the actions run only after it is set.
   */
  get _connection() {
    return /** @type {Hass} */ (this._hass);
  }

  /** @returns {CardConfig} The config, the card renders only after `setConfig()`. */
  get _cfg() {
    return /** @type {CardConfig} */ (this._config);
  }

  /** Locks the editing, the unsaved changes are discarded. */
  _lockEditing() {
    this._lock.lock(this._t('Editing locked.'));
  }

  /**
   * Discards the unsaved changes after locking and shows the message.
   *
   * @param {string} message Message for the user.
   */
  _discardChanges(message) {
    this._draft = null;
    this._edits = {};
    this._formFocused = false;
    this._message = message;
    this._render(true);
  }

  /**
   * Whether the user can edit, and shows why not.
   *
   * @returns {boolean} `false` when the mapping is inconsistent or the card is locked.
   */
  _requireEdit() {
    if (this._bindingError) {
      this._notice(this._bindingError);
      return false;
    }
    if (this._lock.canEdit()) return true;
    this._notice(this._t('Editing is locked. Please enter the password to unlock.'));
    return false;
  }

  /** @returns {Record<FieldKey, string>} Entity ID by field, the manual mapping first. */
  _ids() {
    const entities = this._cfg.entities;
    return /** @type {Record<FieldKey, string>} */ (Object.fromEntries(Object.entries(FIELDS)
      .map(([key, field]) => [key, entities?.[field.configKey] || this._map[/** @type {FieldKey} */ (key)] || ''])));
  }

  /**
   * State of an entity.
   *
   * @param {string} id Entity ID.
   * @returns {HassEntity | undefined} The state, `undefined` when the entity is missing.
   */
  _state(id) {
    return this._hass?.states?.[id];
  }

  /**
   * Temperature of an entity in °C.
   *
   * @param {string} id Entity ID.
   * @returns {number} The temperature, `NaN` when unknown.
   */
  _num(id) {
    return temperature(this._state(id));
  }

  /** @returns {boolean} Whether the user is in a form of the card or the unlock form is open. */
  _editing() {
    return this._lock.formOpen || this._formFocused;
  }

  /** Loads the registry and discovers the controllers, once per config. */
  async _discover() {
    if (!this._hass || !this._config || this._discovered || this._discovering) return;
    this._discovering = true;
    const revision = this._discoveryRevision;
    try {
      const { registry, devices } = await loadRegistry(this._hass, this._translate);
      if (revision !== this._discoveryRevision) return;
      this._registry = registry;
      this._devices = devices;
      this._controllers = discoverControllers(registry, devices, this._translate);
      this._registryError = '';
      this._applySelection();
    } catch (error) {
      if (revision !== this._discoveryRevision) return;
      this._registryError = errorText(error);
      this._applySelection();
    } finally {
      if (revision === this._discoveryRevision) {
        this._discovered = true;
        this._discovering = false;
        this._render();
      }
    }
  }

  /** Chooses the controller and the heating circuit and their entities. */
  _applySelection() {
    const binding = resolveBinding({
      config: this._cfg,
      registry: this._registry,
      controllers: this._controllers,
      registryError: this._registryError,
      controllerId: this._controllerId,
      circuitId: this._circuitId,
      t: this._translate,
    });
    this._controllerId = binding.controllerId;
    this._circuitId = binding.circuitId;
    this._entryId = binding.entryId;
    this._map = binding.map;
    this._bindingError = binding.bindingError;
  }

  /** @returns {boolean} Whether the config or the entity mapping pins the controller. */
  _controllerPinned() {
    return !!(this._cfg.config_entry || this._cfg.serial || Object.keys(this._cfg.entities || {}).length);
  }

  /** @returns {boolean} Whether the config or the entity mapping pins the heating circuit. */
  _circuitPinned() {
    return !!this._cfg.circuit || Object.keys(this._cfg.entities || {}).length > 0;
  }

  /**
   * Shows another controller or heating circuit, switching the view never writes.
   *
   * @param {'controller' | 'circuit'} kind What the user switches.
   * @param {string} value Config entry ID or heating circuit number.
   */
  _chooseTarget(kind, value) {
    this._formFocused = false;
    if (this._busy || this._draft || Object.keys(this._edits).length) {
      this._notice(this._t('Save changes or discard the draft before switching controller or heating circuit.'));
      // Shows the selection of the card again.
      this._render(true);
      return;
    }
    if (kind === 'controller') {
      if (this._controllerPinned() || !this._controllers.some(c => c.id === value)) return;
      this._controllerId = value;
      this._circuitId = '';
    } else {
      const controller = this._controllers.find(c => c.id === this._controllerId);
      if (this._circuitPinned() || !controller?.circuits.some(c => c.id === value)) return;
      this._circuitId = value;
    }
    this._loadingCurve = null;
    this._applySelection();
    this._message = this._t('View changed. No values were sent.');
    if (this._lock.enabled) this._lock.lock(this._t('View changed. Please unlock editing again.'));
    else this._render(true);
  }

  /** @returns {CurvePoint[]} Points of the curve sensor. */
  _readPoints() {
    return readPoints(this._state(this._ids().curve));
  }

  /** @returns {string} Name of the selected curve table, from the select or the curve sensor. */
  _selected() {
    const ids = this._ids();
    const select = this._state(ids.select), curve = this._state(ids.curve);
    if (isAvailable(select)) return select.state;
    return isAvailable(curve) ? curve.state : '';
  }

  /** @returns {string[]} Curve tables that the controller offers. */
  _options() {
    const options = this._state(this._ids().select)?.attributes?.options;
    return Array.isArray(options) ? options.filter(o => typeof o === 'string' && o.startsWith('HC')) : [];
  }

  /** @returns {CurvePoint[]} Copy of the points of the draft or the curve table. */
  _points() {
    return (this._draft?.name === this._selected() ? this._draft.points : this._readPoints()).map(p => ({ ...p }));
  }

  /**
   * Starts a draft of the selected curve table.
   *
   * @param {CurvePoint[]} points The changed points.
   * @returns {Draft} The new draft.
   */
  _startDraft(points) {
    this._draft = { name: this._selected(), points };
    return this._draft;
  }

  /** @returns {boolean} Whether the integration has the action to save points. */
  _pointService() {
    return !!this._hass?.services?.keba_keenergy?.set_heating_curve_points;
  }

  /** @returns {boolean} Whether the points of the selected curve table can be edited and saved. */
  _ready() {
    const curve = this._state(this._ids().curve);
    const conflict = this._options().includes(/** @type {string} */ (curve?.state))
      && /** @type {HassEntity} */ (curve).state !== this._selected();
    return !this._bindingError && !!this._entryId && this._pointService() && !this._busy && !this._loadingCurve
      && this._selected().startsWith('HC') && isAvailable(curve) && Array.isArray(curve.attributes?.points)
      && !conflict;
  }

  /** @returns {EntityRegistryEntry[]} Disabled entities that the card needs. */
  _disabledEditors() {
    const ids = Object.values(this._ids());
    return this._registry.filter(e => e.platform === 'keba_keenergy' && e.config_entry_id === this._entryId
      && e.disabled_by && ids.includes(/** @type {string} */ (e.entity_id)));
  }

  /**
   * Value of a heating limit field: the edit or the entity value.
   *
   * @param {LimitKey} key Field.
   * @returns {number} The value in °C, `NaN` when unknown.
   */
  _fieldValue(key) {
    const id = this._ids()[key], value = this._num(id), sent = this._sent[id];
    // Shows a sent value right away, until the controller reports a value, the sent one or its own.
    return this._edits[key] ?? (sent && Object.is(sent.before, value) ? sent.value : value);
  }

  /** @returns {string} SVG of the chart. */
  _chart() {
    const ids = this._ids();
    return renderChart({
      points: this._points(),
      outdoor: this._num(ids.outdoor),
      target: this._num(ids.target),
      actual: this._num(ids.actual),
      limitDay: this._fieldValue('limitDay'),
      limitNight: this._fieldValue('limitNight'),
      config: this._cfg,
      plotId: this._plotId,
      t: this._translate,
      number: (value, options) => this._number(value, options),
      temperature: value => this._fmt(value),
      textScale: this._textScale,
    });
  }

  /**
   * Redraws the chart when its rendered width changed, so texts, margins and marks keep their size in pixels like
   * the other texts of the card.
   */
  _scaleChart() {
    const width = this._root.querySelector('#chart svg')?.getBoundingClientRect().width;
    if (!width) return;
    const scale = Math.round(CHART_WIDTH / width * 1000) / 1000;
    if (scale === this._textScale) return;
    this._textScale = scale;
    this._preview();
  }

  /** Redraws the chart, for example while the user types. */
  _preview() {
    this._get('#chart').innerHTML = this._chart();
  }

  /** @returns {string} Status message, or the curve table that is loading. */
  _statusMessage() {
    if (this._message) return this._message;
    return this._loadingCurve ? this._t('Loading curve {name} …', { name: this._loadingCurve }) : '';
  }

  /** @returns {Record<'outdoor' | 'target' | 'actual', Reading>} The formatted readings. */
  _readings() {
    const ids = this._ids();
    return {
      outdoor: this._reading(ids.outdoor),
      target: this._reading(ids.target),
      actual: this._reading(ids.actual),
    };
  }

  /**
   * A reading like Home Assistant shows it: the temperature, or `Unavailable` / `Unknown` without a value.
   *
   * @param {string} id Entity ID.
   * @returns {Reading} The text and whether the value is missing.
   */
  _reading(id) {
    const value = this._num(id);
    if (Number.isFinite(value)) return { text: this._fmt(value), missing: false };
    const state = this._state(id);
    return { text: this._t(state && state.state !== 'unavailable' ? 'Unknown' : 'Unavailable'), missing: true };
  }

  /** Updates the chart, the readings and the message without replacing the inputs. */
  _refreshLive() {
    this._preview();
    const readings = { ...this._readings(), points: { text: String(this._points().length), missing: false } };
    for (const [key, { text, missing }] of Object.entries(readings)) {
      const value = this._get('[data-live="' + key + '"]');
      value.textContent = text;
      /** @type {HTMLElement} */ (value.parentElement).classList.toggle('missing', missing);
    }
    this._get('#message').textContent = this._statusMessage();
  }

  /**
   * Replaces the rows of the point table and keeps the rest of the card.
   *
   * @param {CurvePoint[]} points Points of the draft or the curve table.
   * @param {boolean} ready Whether the points can be edited.
   * @param {boolean} dirty Whether the points are a draft.
   */
  _patchPoints(points, ready, dirty) {
    // The surrounding ha-card and the editor buttons stay connected.
    // Replacing the entire card here can reset the dashboard's outer scroll area.
    this._get('.points').innerHTML = pointRows(points, ready, this._translate);
    this._get('#add-point').toggleAttribute('disabled', !ready || points.length >= POINT_LIMITS.count.max);
    this._get('#save-points').toggleAttribute('disabled', !ready);
    this._get('#curve-label').textContent = curveLabel(dirty, this._translate);
    const limits = LIMIT_KEYS.map(key => ({ key, value: this._fieldValue(key) }));
    Object.assign(this._get('#limits-form'), { data: limitsData(limits) });
    this._bindPointRows();
  }

  /**
   * Draws the card.
   *
   * Keeps focused inputs and open selects: a full redraw only when the view changes, otherwise only the readings
   * and the point table.
   *
   * @param {boolean} [force] Redraws also while the user edits.
   */
  _render(force = false) {
    if (!this._config || !this._hass) return;
    // Keep the forms in the DOM while the user is in them, a redraw would close an open menu and drop the focus.
    if (!force && this._editing()) {
      this._pendingRender = true;
      this._refreshLive();
      return;
    }
    this._pendingRender = false;
    const ids = this._ids(), selected = this._selected(), points = this._points();
    const canEdit = this._lock.canEdit() && !this._bindingError, ready = this._ready() && canEdit;
    const options = this._options();
    const tableState = this._state(ids.useCurve)?.state;
    const missing = /** @type {[FieldKey, string][]} */ (Object.entries(ids))
      .filter(([, id]) => !isAvailable(this._state(id)))
      .map(([key, id]) => this._t(FIELD_NAMES[key]) + ' · ' + (id || FIELDS[key].configKey + this._t(' (not mapped)')));
    // Sent points stay until the controller has them, they are no draft any more.
    const dirty = !!this._draft && !this._draft.saved;
    const disabled = this._disabledEditors();
    // Readings change often, the forms stay as long as the view and the editor values are the same.
    const viewState = {
      language: languageCode(this._config, this._hass),
      ids,
      selected,
      options,
      points,
      ready,
      canEdit,
      busy: this._busy,
      loading: this._loadingCurve,
      tableState,
      dirty,
      missing,
      entry: this._entryId,
      controller: this._controllerId,
      circuit: this._circuitId,
      controllers: this._controllers.map(c => [c.id, c.label, c.circuits.map(h => [h.id, h.label])]),
      bindingError: this._bindingError,
      registryError: this._registryError,
      pointService: this._pointService(),
      disabled: disabled.map(e => [e.entity_id, e.disabled_by]),
      settings: LIMIT_KEYS.map((key) => {
        const state = this._state(ids[key]), attributes = state?.attributes || {};
        return [key, isAvailable(state), this._fieldValue(key), attributes.min, attributes.max, attributes.step];
      }),
    };
    const viewKey = JSON.stringify(viewState), shellKey = JSON.stringify({
      ...viewState,
      points: undefined,
      dirty: undefined,
      settings: viewState.settings.map(([key, available, , ...bounds]) => [key, available, ...bounds]),
    });
    if (!force && this._viewKey === viewKey) {
      this._refreshLive();
      return;
    }
    if (!force && this._shellKey === shellKey) {
      this._patchPoints(points, ready, dirty);
      this._viewKey = viewKey;
      this._refreshLive();
      return;
    }
    const model = this._model({ selected, options, points, ready, canEdit, tableState, missing, dirty, disabled });
    this._root.innerHTML = cardTemplate(model, this._translate);
    this._viewKey = viewKey;
    this._shellKey = shellKey;
    this._bind();
    this._bindForms(model);
    this._scaleChart();
  }

  /**
   * Everything the card shows, for `cardTemplate()`.
   *
   * @param {object} view Values that `_render()` already read.
   * @param {string} view.selected Name of the selected curve table.
   * @param {string[]} view.options Curve tables of the controller.
   * @param {CurvePoint[]} view.points Points of the draft or the curve table.
   * @param {boolean} view.ready Whether the points can be edited and saved.
   * @param {boolean} view.canEdit Whether the user can edit.
   * @param {string | undefined} view.tableState State of the switch `use_heating_curve`.
   * @param {string[]} view.missing Missing entities.
   * @param {boolean} view.dirty Whether the points are a draft.
   * @param {EntityRegistryEntry[]} view.disabled Disabled entities that the card needs.
   * @returns {CardModel} The model.
   */
  _model({ selected, options, points, ready, canEdit, tableState, missing, dirty, disabled }) {
    const config = this._cfg, ids = this._ids();
    const modes = {
      on: this._t('Point table is in use'),
      off: this._t('Hybrid active · saved point table'),
    };
    return {
      target: {
        controllers: this._controllers,
        controllerId: this._controllerId,
        circuitId: this._circuitId,
        controllerPinned: this._controllerPinned(),
        circuitPinned: this._circuitPinned(),
        busy: this._busy,
        bindingError: this._bindingError,
        registryError: this._registryError,
      },
      lock: this._lock.enabled
        ? {
            unlocked: this._lock.canEdit(),
            minutes: this._lock.minutes,
            formOpen: this._lock.formOpen,
            verifying: this._lock.verifying,
            error: this._lock.error,
          }
        : null,
      disabledEntities: disabled.length,
      canEnableEntities: !this._busy && canEdit && !!this._hass?.user?.is_admin,
      title: config.title || this._t('Heating curve'),
      mode: tableState === 'on' || tableState === 'off' ? modes[tableState] : this._t('Curve mode unavailable'),
      selected,
      options,
      curveSelectDisabled: !isAvailable(this._state(ids.select)) || this._busy || !canEdit,
      chart: this._chart(),
      dirty,
      flowLimitsNotice: this._flowLimitsNotice(),
      message: this._statusMessage(),
      readings: this._readings(),
      limits: LIMIT_KEYS.map((key) => {
        const state = this._state(ids[key]);
        return {
          key,
          ...LIMIT_FIELDS[key],
          ...numberRange(state),
          value: this._fieldValue(key),
          disabled: !isAvailable(state) || this._busy || !!this._bindingError || !this._lock.canEdit(),
        };
      }),
      limitsDisabled: this._busy || !canEdit,
      points,
      ready,
      discardDisabled: this._busy || !this._lock.canEdit(),
      missing,
      entryMissing: !this._entryId,
      pointServiceMissing: !this._pointService(),
      version: __VERSION__,
    };
  }

  /** @returns {string | null} Notice about the display limits of the flow temperature, `null` without limits. */
  _flowLimitsNotice() {
    const { flow_min: min, flow_max: max } = this._cfg;
    if (min === null && max === null) return null;
    return this._t('Display limits: ')
      + (min !== null ? this._fmt(min) : this._t('no minimum'))
      + this._t(' to ')
      + (max !== null ? this._fmt(max) : this._t('no maximum'))
      + this._t('. Limits apply to the chart only. ');
  }

  /**
   * Shows a status message without a redraw.
   *
   * @param {string} message The message.
   */
  _notice(message) {
    this._message = message;
    this._get('#message').textContent = message;
  }

  /**
   * Element of the card.
   *
   * @param {string} selector CSS selector of an element that the card always shows.
   * @returns {HTMLElement} The element.
   */
  _get(selector) {
    return /** @type {HTMLElement} */ (this._root.querySelector(selector));
  }

  /** Binds the inputs and the remove buttons of the point table. */
  _bindPointRows() {
    const points = this._points(), ready = this._ready() && this._lock.canEdit() && !this._bindingError;
    /** @type {NodeListOf<HTMLElement>} */ (this._root.querySelectorAll('ha-form[data-point]')).forEach((element) => {
      const index = Number(element.dataset.point);
      this._bindForm(element, pointForm(points[index], ready, this._translate), (data) => {
        if (!this._acceptsInput(element, pointData(this._points()[index]))) return;
        const draft = this._draft ?? this._startDraft(this._readPoints());
        draft.saved = false;
        draft.points[index] = { outdoor: numeric(data.outdoor ?? ''), flow: numeric(data.flow ?? '') };
        Object.assign(element, { data });
        this._get('#curve-label').textContent = curveLabel(true, this._translate);
        this._notice(this._t('Points changed · not saved yet'));
        this._preview();
      });
    });
    this._root.querySelectorAll('ha-icon-button[data-remove]').forEach((element) => {
      Object.assign(element, { path: DELETE_ICON });
      element.addEventListener('click', () => {
        const current = this._points();
        if (!this._lock.canEdit() || !this._ready() || current.length <= POINT_LIMITS.count.min) return;
        this._lock.touch();
        current.splice(Number(/** @type {HTMLElement} */ (element).dataset.remove), 1);
        this._startDraft(current);
        this._render();
      });
    });
  }

  /**
   * Whether the user can change values now, else the form shows the values of the card again.
   *
   * Like in Home Assistant, the card gives the form its values, the form does not keep them itself.
   *
   * @param {HTMLElement} form The `ha-form`.
   * @param {Record<string, unknown>} values The values that the card shows.
   * @returns {boolean} `true` when the card takes the input, it extends the unlocked time.
   */
  _acceptsInput(form, values) {
    if (this._lock.canEdit() && !this._busy) {
      this._lock.touch();
      return true;
    }
    Object.assign(form, { data: values });
    return false;
  }

  /**
   * Sets a form element of Home Assistant and its handler, the card keeps the form while it has the focus.
   *
   * @param {HTMLElement} element The `ha-form`.
   * @param {CardForm} form Schema and values.
   * @param {(data: Record<string, unknown>, form: HTMLElement) => unknown} onChange Called with the values.
   */
  _bindForm(element, form, onChange) {
    Object.assign(element, {
      hass: this._hass,
      ...form,
      computeLabel: (/** @type {{ label: string }} */ item) => item.label,
      computeHelper: (/** @type {{ helper?: string }} */ item) => item.helper,
    });
    element.addEventListener('focusin', () => {
      this._formFocused = true;
    });
    element.addEventListener('focusout', () => {
      this._formFocused = false;
    });
    element.addEventListener('value-changed', (event) => {
      event.stopPropagation();
      onChange(/** @type {CustomEvent<{ value: Record<string, unknown> }>} */ (event).detail.value, element);
    });
  }

  /**
   * Binds the forms: controller, heating circuit, curve table and heating limits.
   *
   * @param {CardModel} model What the card shows.
   */
  _bindForms(model) {
    const t = this._translate;
    const targets = targetForms(model.target, t);
    for (const kind of /** @type {('controller' | 'circuit')[]} */ (['controller', 'circuit'])) {
      this._bindForm(this._get(`#${kind}-form`), targets[kind], data => this._chooseTarget(kind, String(data[kind])));
    }
    const curve = curveForm(model, t);
    this._bindForm(this._get('#curve-form'), curve, (data, form) => {
      // The choice closes the menu, the card draws the assignment right away although the form keeps the focus.
      this._formFocused = false;
      // The form shows the table of the controller until the controller has switched it.
      Object.assign(form, { data: curve.data });
      return selectCurve(this, String(data.curve));
    });
    this._bindForm(this._get('#limits-form'), limitsForm(model.limits, t), (data, form) => {
      const shown = limitsData(LIMIT_KEYS.map(key => ({ key, value: this._fieldValue(key) })));
      if (!this._acceptsInput(form, shown)) return;
      for (const key of LIMIT_KEYS.filter(name => data[name] !== shown[name])) {
        this._edits[key] = numeric(data[key] ?? '');
      }
      Object.assign(form, { data });
      this._notice(this._t('Settings changed · not saved yet'));
      this._preview();
    });
    const password = this._root.querySelector('#edit-password');
    if (password) {
      this._bindForm(/** @type {HTMLElement} */ (password), passwordForm(t), (data, form) => {
        Object.assign(form, { data });
      });
      Object.assign(password, { disabled: this._lock.verifying });
    }
  }

  /** Gives the alerts their titles as property, the `title` attribute would also show a tooltip of the browser. */
  _titleAlerts() {
    const alerts = /** @type {HTMLElement[]} */ ([...this._root.querySelectorAll('ha-alert[data-title]')]);
    const setTitles = () => alerts.forEach(alert => Object.assign(alert, { title: alert.dataset.title }));
    if (customElements.get('ha-alert')) setTitles();
    else customElements.whenDefined('ha-alert').then(setTitles);
  }

  /** Binds the event handlers after a full redraw. */
  _bind() {
    const root = this._root;
    this._titleAlerts();
    /**
     * @param {string} selector CSS selector.
     * @param {string} event Event type.
     * @param {(event: Event) => unknown} handler Handler.
     */
    const on = (selector, event, handler) => root.querySelector(selector)?.addEventListener(event, handler);
    this._bindPointRows();
    on('#reload-registry', 'click', () => {
      if (this._busy) return;
      this._discovered = false;
      this._discover();
    });
    on('#unlock-editor', 'click', () => this._lock.openForm());
    on('#lock-editor', 'click', () => this._lock.lock());
    on('#cancel-unlock', 'click', () => this._lockEditing());
    on('#confirm-unlock', 'click', event => this._lock.submit(event));
    on('#edit-password', 'keydown', (event) => {
      const { key } = /** @type {KeyboardEvent} */ (event);
      if (key === 'Enter') return this._lock.submit(event);
      if (key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this._lockEditing();
      }
    });
    on('#reset', 'click', () => {
      if (!this._lock.canEdit() || this._busy) return;
      this._lock.touch();
      this._draft = null;
      this._edits = {};
      this._message = this._t('Draft discarded.');
      this._render();
    });
    on('#retry', 'click', () => {
      this._discovered = false;
      this._registryError = '';
      this._discover();
    });
    on('#enable-editors', 'click', () => enableEntities(this));
    on('#add-point', 'click', () => {
      const points = this._points();
      if (!this._lock.canEdit() || !this._ready() || points.length >= POINT_LIMITS.count.max) return;
      this._lock.touch();
      points.push(newPoint(points));
      this._startDraft(points);
      this._message = this._t('Point added · not saved yet');
      this._render();
    });
    on('#save-points', 'click', () => savePoints(this));
    on('#save-settings', 'click', () => saveLimits(this));
  }
}

if (!customElements.get(CARD_TYPE)) customElements.define(CARD_TYPE, KeEnergyHeatingCurveCard);

/**
 * Entry of the card picker of Home Assistant.
 *
 * @typedef {{ type: string, name?: string, description?: string, preview?: boolean }} CustomCard
 */
const win = /** @type {Window & { customCards?: CustomCard[] }} */ (window);
win.customCards = win.customCards || [];
if (!win.customCards.some(c => c.type === CARD_TYPE)) {
  win.customCards.push({
    type: CARD_TYPE,
    name: 'KEBA KeEnergy Heating Curve Card',
    description: 'Heating curves and limits with automatic discovery · Deutsch / English',
    preview: false,
  });
}
