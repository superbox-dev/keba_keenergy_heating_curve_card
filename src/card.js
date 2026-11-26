// KEBA KeEnergy Heating Curve Card: shows and edits the heating curve of a heating circuit.
import { FIELDS, discoverControllers, loadRegistry } from './discovery.js';
import { errorText, formatNumber, languageCode, translate } from './i18n.js';
import { enableEntities, saveLimits, savePoints, selectCurve } from './card/actions.js';
import { resolveBinding } from './card/binding.js';
import { renderChart } from './card/chart.js';
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
import { cardTemplate, curveLabel, pointRows } from './card/templates.js';
import './editor.js';

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
 */

/**
 * Points of a curve table that the user changed, not saved yet.
 *
 * @typedef {object} Draft
 * @property {string} name Name of the curve table.
 * @property {CurvePoint[]} points The changed points.
 * @property {boolean} [saved] Whether the points were sent and the card waits for the controller values.
 */

const CARD_TYPE = 'keba-keenergy-heating-curve-card';
const EDITOR_TYPE = 'keba-keenergy-heating-curve-card-editor';

/** Number of cards on the page, for unique SVG IDs. */
let cardSequence = 0;

export class KeEnergyHeatingCurveCard extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    this._root = root;
    /** @type {CardConfig | undefined} */
    this._config = undefined;
    /** @type {Hass | undefined} */
    this._hass = undefined;
    this._lock = new EditLock({
      t: (text, params) => this._t(text, params),
      render: force => this._render(force),
      passwordInput: () => this._root.querySelector('#edit-password'),
      onLocked: message => this._discardChanges(message),
      onUnlocked: (message) => {
        this._message = message;
      },
    });
    /** Unsaved heating limits by field, in °C. @type {Partial<Record<LimitKey, number>>} */
    this._edits = {};
    /** @type {Draft | null} */
    this._draft = null;
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
    /** Whether the user opens or uses a select element. */
    this._selectInteracting = false;
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
    /** @type {string | null} */
    this._registryError = '';
    /** Curve table that the card assigned and waits for. @type {string | null} */
    this._loadingCurve = null;
    this._visibilityHandler = () => {
      if (this._lock.enabled && globalThis.document?.hidden) this._lock.lock(this._t('Editing locked.'));
    };
    const flush = () => queueMicrotask(() => {
      if (this._pendingRender && !this._editing()) this._render();
    });
    root.addEventListener('focusout', (event) => {
      // A button click must reach its handler before a pending redraw replaces that button.
      const target = /** @type {Element | null} */ (/** @type {FocusEvent} */ (event).relatedTarget);
      if (target && root.contains(target) && target.matches('button')) return;
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
    this._selectInteracting = false;
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
        this._controllers = discoverControllers(this._registry, this._devices, text => this._t(text));
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

  /** @returns {HTMLElement} The visual card editor. */
  static getConfigElement() {
    return document.createElement(EDITOR_TYPE);
  }

  /** Locks when the page is hidden, while the card is on the page. */
  connectedCallback() {
    globalThis.document?.addEventListener('visibilitychange', this._visibilityHandler);
  }

  /** Locks when the card leaves the page, the unsaved changes are discarded. */
  disconnectedCallback() {
    globalThis.document?.removeEventListener('visibilitychange', this._visibilityHandler);
    if (this._lock.enabled) this._lock.lock(this._t('Editing locked.'));
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
   * @returns {string} The temperature with unit, `—` when unknown.
   */
  _fmt(value) {
    return Number.isFinite(value) ? this._number(value) + ' °C' : '—';
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

  /**
   * Discards the unsaved changes after locking and shows the message.
   *
   * @param {string} message Message for the user.
   */
  _discardChanges(message) {
    this._draft = null;
    this._edits = {};
    this._selectInteracting = false;
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

  /** @returns {boolean} Whether the user is in an input, a select or the unlock form. */
  _editing() {
    return this._lock.formOpen || this._selectInteracting
      || !!this._root.activeElement?.matches('input, select');
  }

  /** Loads the registry and discovers the controllers, once per config. */
  async _discover() {
    if (!this._hass || !this._config || this._discovered || this._discovering) return;
    this._discovering = true;
    const revision = this._discoveryRevision;
    try {
      const { registry, devices } = await loadRegistry(this._hass, text => this._t(text));
      if (revision !== this._discoveryRevision) return;
      this._registry = registry;
      this._devices = devices;
      this._controllers = discoverControllers(registry, devices, text => this._t(text));
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
      registryError: this._registryError || '',
      controllerId: this._controllerId,
      circuitId: this._circuitId,
      t: (text, params) => this._t(text, params),
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
    this._selectInteracting = false;
    if (this._busy || this._draft || Object.keys(this._edits).length) {
      this._notice(this._t('Save changes or discard the draft before switching controller or heating circuit.'));
      const select = /** @type {HTMLSelectElement} */ (this._root.querySelector('#' + kind + '-select'));
      select.value = kind === 'controller' ? this._controllerId : this._circuitId;
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
    return this._edits[key] ?? this._num(this._ids()[key]);
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
      dark: !!this._hass?.themes?.darkMode,
      plotId: this._plotId,
      t: (text, params) => this._t(text, params),
      number: (value, options) => this._number(value, options),
      temperature: value => this._fmt(value),
    });
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

  /** @returns {Record<'outdoor' | 'target' | 'actual', string>} The formatted readings. */
  _readings() {
    const ids = this._ids();
    return {
      outdoor: this._fmt(this._num(ids.outdoor)),
      target: this._fmt(this._num(ids.target)),
      actual: this._fmt(this._num(ids.actual)),
    };
  }

  /** Updates the chart, the readings and the message without replacing the inputs. */
  _refreshLive() {
    this._preview();
    const values = { ...this._readings(), points: this._points().length };
    for (const [key, value] of Object.entries(values)) {
      this._get('[data-live="' + key + '"]').textContent = String(value);
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
    const table = this._get('.table-wrap');
    const top = table.scrollTop, left = table.scrollLeft;
    // The surrounding ha-card, editor buttons and scroll container stay connected.
    // Replacing the entire card here can reset the dashboard's outer scroll area.
    this._get('tbody').innerHTML = pointRows(points, ready, (text, params) => this._t(text, params));
    table.scrollTop = top;
    table.scrollLeft = left;
    /** @type {HTMLButtonElement} */ (this._get('#add-point')).disabled = !ready
      || points.length >= POINT_LIMITS.count.max;
    /** @type {HTMLButtonElement} */ (this._get('#save-points')).disabled = !ready;
    this._get('#curve-label').textContent = curveLabel(dirty, (text, params) => this._t(text, params));
    for (const key of LIMIT_KEYS) {
      const value = this._fieldValue(key);
      /** @type {HTMLInputElement} */ (this._get('[data-setting="' + key + '"]')).value = Number.isFinite(value)
        ? String(value)
        : '';
    }
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
    // Keep the real <select> and inputs in the DOM while the user interacts with them.
    // In particular, replacing a focused native select dismisses its open menu.
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
      .map(([key, id]) => id || FIELDS[key].configKey + this._t(' (not mapped)'));
    const dirty = !!this._draft;
    const disabled = this._disabledEditors();
    // Readings change frequently; keep the actual controls and scroll container
    // when the editor structure/data is unchanged. Scrollbar dragging and touch
    // scrolling must not depend on an input already having keyboard focus.
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
    const previousTable = this._root.querySelector('.table-wrap');
    const tableScroll = previousTable ? { top: previousTable.scrollTop, left: previousTable.scrollLeft } : null;
    this._root.innerHTML = cardTemplate(this._model({
      selected,
      options,
      points,
      ready,
      canEdit,
      tableState,
      missing,
      dirty,
      disabled,
    }), (text, params) => this._t(text, params));
    this._viewKey = viewKey;
    this._shellKey = shellKey;
    this._bind();
    const table = this._root.querySelector('.table-wrap');
    if (table && tableScroll) {
      table.scrollTop = tableScroll.top;
      table.scrollLeft = tableScroll.left;
    }
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
        registryError: this._registryError || '',
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
      title: config.title || this._t('KeEnergy heating curve'),
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
    this._root.querySelectorAll('[data-point]').forEach(element => element.addEventListener('input', () => {
      if (!this._lock.canEdit() || this._busy) return;
      const input = /** @type {HTMLInputElement} */ (element);
      this._lock.touch();
      if (!this._draft) this._draft = { name: this._selected(), points: this._readPoints() };
      this._draft.saved = false;
      const axis = /** @type {'outdoor' | 'flow'} */ (input.dataset.axis);
      this._draft.points[Number(input.dataset.point)][axis] = numeric(input.value);
      this._notice(this._t('Points changed · not saved yet'));
      this._preview();
    }));
    this._root.querySelectorAll('[data-remove]').forEach(element => element.addEventListener('click', () => {
      const points = this._points();
      if (!this._lock.canEdit() || !this._ready() || points.length <= POINT_LIMITS.count.min) return;
      this._lock.touch();
      points.splice(Number(/** @type {HTMLElement} */ (element).dataset.remove), 1);
      this._draft = { name: this._selected(), points };
      this._render();
    }));
  }

  /**
   * Tracks a select element, the card keeps it while the user opens or uses it.
   *
   * @param {string} selector CSS selector of the select element.
   * @param {(value: string) => unknown} onChange Called with the chosen value.
   */
  _bindSelect(selector, onChange) {
    const select = /** @type {HTMLSelectElement} */ (this._root.querySelector(selector));
    select.addEventListener('pointerdown', (event) => {
      const target = /** @type {HTMLSelectElement} */ (event.target);
      if (event.button === 0 && !target.disabled) this._selectInteracting = true;
    });
    select.addEventListener('focus', () => {
      this._selectInteracting = true;
    });
    select.addEventListener('blur', () => {
      this._selectInteracting = false;
    });
    select.addEventListener('change', () => {
      const { value } = select;
      this._selectInteracting = false;
      select.blur();
      return onChange(value);
    });
  }

  /** Binds the event handlers after a full redraw. */
  _bind() {
    const root = this._root;
    /**
     * @param {string} selector CSS selector.
     * @param {string} event Event type.
     * @param {(event: Event) => unknown} handler Handler.
     */
    const on = (selector, event, handler) => root.querySelector(selector)?.addEventListener(event, handler);
    this._bindPointRows();
    this._bindSelect('#controller-select', value => this._chooseTarget('controller', value));
    this._bindSelect('#circuit-select', value => this._chooseTarget('circuit', value));
    on('#reload-registry', 'click', () => {
      if (this._busy) return;
      this._discovered = false;
      this._discover();
    });
    on('#unlock-editor', 'click', () => this._lock.openForm());
    on('#lock-editor', 'click', () => this._lock.lock());
    on('#cancel-unlock', 'click', () => this._lock.lock(this._t('Editing locked.')));
    on('#confirm-unlock', 'click', event => this._lock.submit(event));
    on('#unlock-form', 'submit', event => this._lock.submit(event));
    on('#edit-password', 'keydown', (event) => {
      const { key } = /** @type {KeyboardEvent} */ (event);
      if (key === 'Enter') return this._lock.submit(event);
      if (key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this._lock.lock(this._t('Editing locked.'));
      }
    });
    root.querySelectorAll('[data-setting]').forEach(element => element.addEventListener('input', () => {
      if (!this._lock.canEdit() || this._busy) return;
      const input = /** @type {HTMLInputElement} */ (element);
      this._lock.touch();
      this._edits[/** @type {LimitKey} */ (input.dataset.setting)] = numeric(input.value);
      this._notice(this._t('Settings changed · not saved yet'));
      this._preview();
    }));
    this._bindSelect('#curve-select', value => selectCurve(this, value));
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
      this._registryError = null;
      this._discover();
    });
    on('#enable-editors', 'click', () => enableEntities(this));
    on('#add-point', 'click', () => {
      const points = this._points();
      if (!this._lock.canEdit() || !this._ready() || points.length >= POINT_LIMITS.count.max) return;
      this._lock.touch();
      points.push(newPoint(points));
      this._draft = { name: this._selected(), points };
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
