// HTML templates of the card, every interpolated value goes through `esc()`.
import { disabledIf, esc, html } from '../html.js';
import { POINT_LIMITS } from './points.js';
import { STYLE } from './styles.js';

/**
 * @typedef {import('../discovery.js').Controller} Controller
 * @typedef {import('../types.js').Translate} Translate
 * @typedef {import('./entities.js').LimitKey} LimitKey
 * @typedef {import('./points.js').CurvePoint} CurvePoint
 */

/**
 * Controller and heating circuit selection.
 *
 * @typedef {object} TargetModel
 * @property {Controller[]} controllers Discovered controllers.
 * @property {string} controllerId Shown controller.
 * @property {string} circuitId Shown heating circuit.
 * @property {boolean} controllerPinned Whether the config pins the controller.
 * @property {boolean} circuitPinned Whether the config pins the heating circuit.
 * @property {boolean} busy Whether an action is running.
 * @property {string} bindingError Error of the mapping, empty without error.
 * @property {string} registryError Error of loading the registry, empty without error.
 */

/**
 * A form of the card as `ha-form`: its schema and its values.
 *
 * @typedef {object} CardForm
 * @property {object[]} schema Schema of the fields, with the translated `label` and `helper` of each.
 * @property {Record<string, unknown>} data Values of the fields.
 */

/**
 * State of the password lock.
 *
 * @typedef {object} LockModel
 * @property {boolean} unlocked Whether the user can edit.
 * @property {number} minutes Minutes until the card locks again.
 * @property {boolean} formOpen Whether the unlock form is shown.
 * @property {boolean} verifying Whether a password check is running.
 * @property {string} error Error of the last password check.
 */

/**
 * Input field of a heating limit, temperatures in °C.
 *
 * @typedef {object} LimitModel
 * @property {LimitKey} key Field.
 * @property {string} label English label.
 * @property {string} unit Unit.
 * @property {number} value Current value or edit, `NaN` when unknown.
 * @property {number} min Smallest value of the entity, `NaN` without.
 * @property {number} max Largest value of the entity, `NaN` without.
 * @property {number} step Step size of the entity, `NaN` without.
 * @property {boolean} disabled Whether the field is disabled.
 */

/**
 * Everything the card shows.
 *
 * @typedef {object} CardModel
 * @property {TargetModel} target Controller and heating circuit selection.
 * @property {LockModel | null} lock Password lock, `null` without password.
 * @property {number} disabledEntities Number of disabled entities the card needs.
 * @property {boolean} canEnableEntities Whether the user can enable them.
 * @property {string} title Title of the card.
 * @property {string} mode Curve mode of the heating circuit.
 * @property {string} selected Name of the selected curve table, empty when unknown.
 * @property {string[]} options Curve tables of the controller.
 * @property {boolean} curveSelectDisabled Whether the curve table selection is disabled.
 * @property {string} chart SVG of the chart.
 * @property {boolean} dirty Whether the points are a draft.
 * @property {string | null} flowLimitsNotice Display limits of the flow temperature, `null` without limits.
 * @property {string} message Status message.
 * @property {Record<'outdoor' | 'target' | 'actual', Reading>} readings Formatted temperatures.
 * @property {LimitModel[]} limits Heating limit fields.
 * @property {boolean} limitsDisabled Whether saving the heating limits is disabled.
 * @property {CurvePoint[]} points Points of the draft or the curve table.
 * @property {boolean} ready Whether the points can be edited and saved.
 * @property {boolean} discardDisabled Whether discarding the draft is disabled.
 * @property {string[]} missing Missing entities, their name with the entity ID or the config key.
 * @property {boolean} entryMissing Whether the config entry is unknown.
 * @property {boolean} pointServiceMissing Whether the integration has no action to save points.
 * @property {string} version Version of the card.
 */

/**
 * The whole card with its styles.
 *
 * @param {CardModel} model What the card shows.
 * @param {Translate} t Translates the texts.
 * @returns {string} The content of the shadow root.
 */
export function cardTemplate(model, t) {
  return html`<style>${STYLE}</style>
    <ha-card header="KEBA KeEnergy">
      ${targetPanel(model.target, t)}
      ${setupAlert(model, t)}
      ${model.lock ? lockPanel(model.lock, t) : ''}
      ${model.disabledEntities ? setupNotice(model.disabledEntities, model.canEnableEntities, t) : ''}
      <div class="layout">${chartPanel(model, t)}${sidePanel(model, t)}</div>
      ${editorSection(model, t)}
    </ha-card>`;
}

/**
 * Label of the curve in the legend.
 *
 * @param {boolean} dirty Whether the points are a draft.
 * @param {Translate} t Translates the texts.
 * @returns {string} The label, not escaped.
 */
export function curveLabel(dirty, t) {
  return t('Point table') + (dirty ? t(' · Draft') : '');
}

/**
 * Rows of the point table.
 *
 * @param {CurvePoint[]} points Points of the draft or the curve table.
 * @param {boolean} ready Whether the points can be edited.
 * @param {Translate} t Translates the texts.
 * @returns {string} The rows.
 */
export function pointRows(points, ready, t) {
  return points.map((point, index) => {
    const number = index + 1;
    const removeLabel = esc(t('Remove point {index}', { index: number }));
    const removeDisabled = disabledIf(!ready || points.length <= POINT_LIMITS.count.min);
    return html`<div class="point-row">
      <span class="point-number">${number}</span>
      <ha-form data-point="${index}"></ha-form>
      <ha-icon-button data-remove="${index}" label="${removeLabel}" ${removeDisabled}></ha-icon-button>
    </div>`;
  }).join('');
}

/**
 * The fields of a point as `ha-form`, the outdoor and the flow temperature next to each other.
 *
 * @param {CurvePoint} point The point, `NaN` when a field is empty.
 * @param {boolean} ready Whether the points can be edited.
 * @param {Translate} t Translates the labels.
 * @returns {CardForm} The schema and the values.
 */
export function pointForm(point, ready, t) {
  /** @param {'outdoor' | 'flow'} axis */
  const field = axis => ({
    name: axis,
    label: t(axis === 'outdoor' ? 'Outdoor °C' : 'Flow °C'),
    disabled: !ready,
    selector: { number: { mode: 'box', step: 'any', min: POINT_LIMITS[axis].min, max: POINT_LIMITS[axis].max } },
  });
  return {
    // Both fields stay next to each other also in a narrow card, one row per point.
    schema: [{
      name: 'point',
      label: '',
      type: 'grid',
      flatten: true,
      column_min_width: '120px',
      schema: [field('outdoor'), field('flow')],
    }],
    data: pointData(point),
  };
}

/**
 * The values of the fields of a point.
 *
 * @param {CurvePoint} point The point.
 * @returns {Record<'outdoor' | 'flow', number | undefined>} The values, `undefined` when empty.
 */
export function pointData(point) {
  return {
    outdoor: Number.isFinite(point.outdoor) ? point.outdoor : undefined,
    flow: Number.isFinite(point.flow) ? point.flow : undefined,
  };
}

/**
 * Selection of the controller and the heating circuit.
 *
 * @param {TargetModel} model The selection.
 * @param {Translate} t Translates the texts.
 * @returns {string} The section.
 */
function targetPanel(model, t) {
  return html`<section class="target-panel" aria-label="${esc(t('Controller and heating circuit'))}">
    <ha-form id="controller-form" class="target-form"></ha-form>
    <ha-form id="circuit-form" class="target-form"></ha-form>
    <ha-button id="reload-registry" appearance="outlined" ${disabledIf(model.busy)}>${esc(t('Rediscover'))}</ha-button>
    ${model.bindingError ? html`<ha-alert class="target-error" alert-type="error">${esc(model.bindingError)}</ha-alert>` : ''}
    ${model.registryError ? html`<ha-alert class="registry-error" alert-type="warning">${esc(t('Registry: '))}${esc(model.registryError)}</ha-alert>` : ''}
  </section>`;
}

/**
 * A selection as `ha-form`.
 *
 * @typedef {object} SelectField
 * @property {string} name Name of the field, the key of its value.
 * @property {string} label Label.
 * @property {string} [helper] Help text below the field.
 * @property {boolean} disabled Whether the selection is disabled.
 * @property {string} selected Selected value.
 * @property {string} missingLabel Label of the selected value when the options do not have it, empty when they have.
 * @property {{ value: string, label: string }[]} options Options.
 * @property {string} emptyLabel Label and value without options.
 */

/**
 * A selection as `ha-form`, a missing selected value and an empty list are options of the select field.
 *
 * @param {SelectField} field The selection.
 * @returns {CardForm} The schema and the value.
 */
function selectForm({ name, label, helper, disabled, selected, missingLabel, options, emptyLabel }) {
  const items = [...missingLabel ? [{ value: selected, label: missingLabel }] : [], ...options];
  const value = items.length ? selected : emptyLabel;
  return {
    schema: [{
      name,
      label,
      ...helper ? { helper } : {},
      required: true,
      disabled,
      selector: { select: { mode: 'dropdown', options: items.length ? items : [{ value, label: emptyLabel }] } },
    }],
    data: { [name]: value },
  };
}

/**
 * The selections of the controller and the heating circuit as `ha-form`.
 *
 * @param {TargetModel} model The selection.
 * @param {Translate} t Translates the texts.
 * @returns {Record<'controller' | 'circuit', CardForm>} The schema and the value of each form.
 */
export function targetForms(model, t) {
  const { controllers, controllerId, circuitId, busy } = model;
  const controller = controllers.find(c => c.id === controllerId);
  const circuits = controller?.circuits || [];
  /** @param {{ id: string, label: string }[]} entries */
  const options = entries => entries.map(({ id, label }) => ({ value: id, label }));
  return {
    controller: selectForm({
      name: 'controller',
      label: t('Controller'),
      disabled: busy || model.controllerPinned || controllers.length < 2,
      selected: controllerId,
      missingLabel: controllerId && !controller ? t('Selected controller is missing') : '',
      options: options(controllers),
      emptyLabel: t('No controller found'),
    }),
    circuit: selectForm({
      name: 'circuit',
      label: t('Heating circuit'),
      disabled: busy || model.circuitPinned || circuits.length < 2,
      selected: circuitId,
      missingLabel: circuitId && !circuits.some(c => c.id === circuitId) ? t('Selected heating circuit is missing') : '',
      options: options(circuits),
      emptyLabel: t('No heating circuit found'),
    }),
  };
}

/**
 * Status of the password lock with the unlock form.
 *
 * @param {LockModel} model State of the lock.
 * @param {Translate} t Translates the texts.
 * @returns {string} The section.
 */
function lockPanel(model, t) {
  const { unlocked, verifying } = model;
  const status = unlocked ? t('Editing unlocked') : t('Editing locked');
  const hint = unlocked
    ? t('Locks automatically after {minutes} minutes without editing.', { minutes: model.minutes })
    : t('Unlock to change the curve table, points and heating limits.');
  const form = model.formOpen && !unlocked
    ? html`<div id="unlock-form" class="unlock-form">
        <ha-form id="edit-password"></ha-form>
        <div class="buttons">
          <ha-button id="cancel-unlock" appearance="plain">${esc(t('Cancel'))}</ha-button>
          <ha-button id="confirm-unlock" ${disabledIf(verifying)}>
            ${esc(verifying ? t('Verifying …') : t('Unlock editing'))}
          </ha-button>
        </div>
        <ha-alert class="unlock-error" alert-type="error">${esc(model.error)}</ha-alert>
      </div>`
    : '';
  return html`<section class="edit-lock" aria-label="${esc(t('Password protection'))}">
    <ha-alert id="lock-status" alert-type="info" data-title="${esc(status)}">
      <ha-icon slot="icon" icon="mdi:${unlocked ? 'lock-open-outline' : 'lock-outline'}" aria-hidden="true"></ha-icon>
      <span class="lock-hint">${esc(hint)}</span>
      <ha-button slot="action" id="${unlocked ? 'lock-editor' : 'unlock-editor'}" appearance="plain">
        ${esc(unlocked ? t('Lock') : t('Unlock'))}
      </ha-button>
    </ha-alert>
    ${form}
  </section>`;
}

/**
 * The password field of the unlock form as `ha-form`, empty after every check.
 *
 * @param {Translate} t Translates the texts.
 * @returns {CardForm} The schema and no value.
 */
export function passwordForm(t) {
  return {
    schema: [{
      name: 'password',
      label: t('Password'),
      required: true,
      selector: { text: { type: 'password', autocomplete: 'current-password' } },
    }],
    data: {},
  };
}

/**
 * Notice about disabled entities with the button to enable them.
 *
 * @param {number} count Number of disabled entities.
 * @param {boolean} canEnable Whether the user can enable them.
 * @param {Translate} t Translates the texts.
 * @returns {string} The notice.
 */
function setupNotice(count, canEnable, t) {
  const text = t('{count} required KEBA KeEnergy entities are disabled. An administrator can enable the required entities for this heating circuit.', { count });
  return html`<ha-alert id="enable-panel" alert-type="warning" data-title="${esc(t('Enable editing'))}">
    <span class="enable-hint">${esc(text)}</span>
    <ha-button slot="action" id="enable-editors" appearance="plain" ${disabledIf(!canEnable)}>
      ${esc(t('Enable required entities'))}
    </ha-button>
  </ha-alert>`;
}

/**
 * Chart with title, legend and status message.
 *
 * @param {CardModel} model What the card shows.
 * @param {Translate} t Translates the texts.
 * @returns {string} The section.
 */
function chartPanel(model, t) {
  const limitsLegend = model.flowLimitsNotice !== null
    ? html`<span><i class="line flow-range"></i>${esc(t('Flow min / max'))}</span>`
    : '';
  const notice = model.flowLimitsNotice ?? t('Saved table with linearly interpolated values. ');
  return html`<section class="chart-panel">
    <header>
      <div><h2>${esc(model.title)}</h2><p class="curve-mode">${esc(model.mode)}</p></div>
      <span class="curve-table">${esc(model.selected || '—')}</span>
    </header>
    <div id="chart">${model.chart}</div>
    <div class="legend">
      <span><i class="line"></i><span id="curve-label">${esc(curveLabel(model.dirty, t))}</span></span>
      <span><i class="dot target"></i>${esc(t('Controller target'))}</span>
      <span><i class="dot actual"></i>${esc(t('Actual flow'))}</span>
      ${limitsLegend}
      <span><i class="dot interpolated"></i>${esc(t('Interpolated values'))}</span>
    </div>
    <ha-alert class="notice" alert-type="info">${esc(notice)}${esc(t('The controller target is read separately from KEBA KeEnergy.'))}</ha-alert>
    <ha-alert id="message" alert-type="info" role="status">${esc(model.message)}</ha-alert>
  </section>`;
}

/**
 * Curve table selection, readings and heating limits.
 *
 * @param {CardModel} model What the card shows.
 * @param {Translate} t Translates the texts.
 * @returns {string} The aside element.
 */
function sidePanel(model, t) {
  return html`<aside>
    <h3>${esc(t('Select curve table'))}</h3>
    <ha-form id="curve-form"></ha-form>
    <h3>${esc(t('Current readings'))}</h3>
    <div class="metrics">
      ${metric(t('Outdoor temperature'), model.readings.outdoor, '', 'outdoor')}
      ${metric(t('Target flow'), model.readings.target, 'target', 'target')}
      ${metric(t('Actual flow'), model.readings.actual, 'actual', 'actual')}
      ${metric(t('Points'), { text: String(model.points.length), missing: false }, '', 'points')}
    </div>
    <h3>${esc(t('Heating limits'))}</h3>
    <ha-form id="limits-form"></ha-form>
    <ha-button id="save-settings" ${disabledIf(model.limitsDisabled)}>${esc(t('Save heating limits'))}</ha-button>
  </aside>`;
}

/**
 * The curve table selection as `ha-form`, the current table stays selectable when the controller does not offer it.
 *
 * @param {CardModel} model What the card shows.
 * @param {Translate} t Translates the texts.
 * @returns {CardForm} The schema and the value.
 */
export function curveForm(model, t) {
  const { selected, options } = model;
  return selectForm({
    name: 'curve',
    label: t('Curve table for this heating circuit'),
    helper: t('Choose one of the heating tables (HC…) offered by the controller. Selecting a table assigns it to this heating circuit. A table can be shared by several circuits on the same controller.'),
    disabled: model.curveSelectDisabled,
    selected,
    missingLabel: selected && !options.includes(selected) ? t('Current: {name}', { name: selected }) : '',
    options: options.map(name => ({ value: name, label: name })),
    emptyLabel: selected || t('No curves available'),
  });
}

/**
 * The heating limit fields as `ha-form`, sliders with the range and the step of the entities.
 *
 * @param {LimitModel[]} limits The fields.
 * @param {Translate} t Translates the labels.
 * @returns {CardForm} The schema and the values, `undefined` when unknown.
 */
export function limitsForm(limits, t) {
  return {
    // Sliders with a number field, like the number entities of Home Assistant, without a range only the field.
    // Next to each other when both have room, else below each other.
    schema: [{
      name: 'limits',
      label: '',
      type: 'grid',
      flatten: true,
      column_min_width: '250px',
      schema: limits.map(({ key, label, unit, min, max, step, disabled }) => ({
        name: key,
        label: `${t(label)} (${unit})`,
        disabled,
        selector: {
          number: {
            mode: 'slider',
            step: Number.isFinite(step) && step > 0 ? step : 'any',
            ...Number.isFinite(min) ? { min } : {},
            ...Number.isFinite(max) ? { max } : {},
          },
        },
      })),
    }],
    data: limitsData(limits),
  };
}

/**
 * The values of the heating limit fields.
 *
 * @param {{ key: LimitKey, value: number }[]} limits The fields with their value in °C.
 * @returns {Record<string, number | undefined>} The values, `undefined` when unknown.
 */
export function limitsData(limits) {
  return Object.fromEntries(limits.map(({ key, value }) => [key, Number.isFinite(value) ? value : undefined]));
}

/**
 * A reading of a tile.
 *
 * @typedef {object} Reading
 * @property {string} text Formatted value, or `Unavailable` / `Unknown`.
 * @property {boolean} missing Whether the value is missing, the tile shows the text like a state of Home Assistant.
 */

/**
 * Tile of a reading.
 *
 * @param {string} label Label.
 * @param {Reading} reading Formatted value.
 * @param {string} cls Additional class.
 * @param {string} key Key of `data-live` for the live update.
 * @returns {string} The tile.
 */
function metric(label, reading, cls, key) {
  return html`<div class="metric ${cls}${reading.missing ? ' missing' : ''}">
    <span>${esc(label)}</span><b data-live="${key}">${esc(reading.text)}</b>
  </div>`;
}

/**
 * Point table with its buttons and the setup hints.
 *
 * @param {CardModel} model What the card shows.
 * @param {Translate} t Translates the texts.
 * @returns {string} The section.
 */
function editorSection(model, t) {
  const { ready, points } = model;
  const intro = t('1 to 16 points. The preview updates as you type. The table is sent only when you select “Save points”.');
  return html`<section class="editor">
    <div class="editor-head">
      <div><h3>${esc(t('Edit curve points'))}</h3><p>${esc(intro)}</p></div>
      <div class="buttons">
        <ha-button id="reset" appearance="outlined" ${disabledIf(model.discardDisabled)}>${esc(t('Discard draft'))}</ha-button>
        <ha-button id="add-point" appearance="outlined" ${disabledIf(!ready || points.length >= POINT_LIMITS.count.max)}>
          ${esc(t('Add point'))}
        </ha-button>
        <ha-button id="save-points" ${disabledIf(!ready)}>${esc(t('Save points'))}</ha-button>
      </div>
    </div>
    <div class="points">${pointRows(points, ready, t)}</div>
    <p class="hint">${esc(t('KEBA KeEnergy heating curve · General version {version}', { version: model.version }))}</p>
  </section>`;
}

/**
 * Warning about missing entities and actions, at the top of the card like the warnings of Home Assistant.
 *
 * @param {CardModel} model What the card shows.
 * @param {Translate} t Translates the texts.
 * @returns {string} The `ha-alert`, empty when everything is there.
 */
function setupAlert(model, t) {
  const { missing } = model;
  if (!missing.length && !model.entryMissing && !model.pointServiceMissing) return '';
  const missingText = t('These entities are missing or do not yet provide values:');
  const entryText = t('Integration entry not found yet. Optionally set config_entry in the card.');
  const serviceText = t('The keba_keenergy.set_heating_curve_points action is unavailable. The integration must support editing curve points.');
  return html`<ha-alert id="setup-details" alert-type="warning" data-title="${esc(t('Check entities / setup'))}">
    ${missing.length ? html`<p>${esc(missingText)}</p>` : ''}
    <ul>${missing.map(item => html`<li>${esc(item)}</li>`).join('')}</ul>
    ${model.entryMissing ? html`<p>${esc(entryText)}</p>` : ''}
    ${model.pointServiceMissing ? html`<p>${esc(serviceText)}</p>` : ''}
    <ha-button slot="action" id="retry" appearance="plain">${esc(t('Reload mapping'))}</ha-button>
  </ha-alert>`;
}
