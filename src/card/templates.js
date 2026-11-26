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
 * @property {Record<'outdoor' | 'target' | 'actual', string>} readings Formatted temperatures.
 * @property {LimitModel[]} limits Heating limit fields.
 * @property {boolean} limitsDisabled Whether saving the heating limits is disabled.
 * @property {CurvePoint[]} points Points of the draft or the curve table.
 * @property {boolean} ready Whether the points can be edited and saved.
 * @property {boolean} discardDisabled Whether discarding the draft is disabled.
 * @property {string[]} missing Missing entities, entity IDs or config keys.
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
    <ha-card>
      ${targetPanel(model.target, t)}
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
    return html`<tr>
      <td>${number}</td>
      <td>${pointInput(index, 'outdoor', point.outdoor, ready, t('Point {index} outdoor temperature', { index: number }))}</td>
      <td>${pointInput(index, 'flow', point.flow, ready, t('Point {index} flow temperature', { index: number }))}</td>
      <td><button type="button" data-remove="${index}" ${removeDisabled} aria-label="${removeLabel}">×</button></td>
    </tr>`;
  }).join('');
}

/**
 * Input field of a point temperature.
 *
 * @param {number} index Index of the point.
 * @param {'outdoor' | 'flow'} axis Temperature of the point.
 * @param {number} value Temperature in °C, `NaN` for an empty field.
 * @param {boolean} ready Whether the points can be edited.
 * @param {string} label Accessible label.
 * @returns {string} The input element.
 */
function pointInput(index, axis, value, ready, label) {
  const { min, max } = POINT_LIMITS[axis];
  const attributes = [
    `data-point="${index}"`,
    `data-axis="${axis}"`,
    'type="number"',
    'step="any"',
    `min="${min}"`,
    `max="${max}"`,
    `value="${Number.isFinite(value) ? value : ''}"`,
    disabledIf(!ready),
    `aria-label="${esc(label)}"`,
  ];
  return `<input ${attributes.join(' ')}>`;
}

/**
 * Selection of the controller and the heating circuit.
 *
 * @param {TargetModel} model The selection.
 * @param {Translate} t Translates the texts.
 * @returns {string} The section.
 */
function targetPanel(model, t) {
  const { controllers, controllerId, circuitId, busy } = model;
  const controller = controllers.find(c => c.id === controllerId);
  const circuits = controller?.circuits || [];
  const controllerSelect = targetSelect({
    id: 'controller-select',
    label: t('Controller'),
    disabled: busy || model.controllerPinned || controllers.length < 2,
    selected: controllerId,
    missing: !!controllerId && !controller,
    missingLabel: t('Selected controller is missing'),
    options: controllers,
    emptyLabel: t('No controller found'),
  });
  const circuitSelect = targetSelect({
    id: 'circuit-select',
    label: t('Heating circuit'),
    disabled: busy || model.circuitPinned || circuits.length < 2,
    selected: circuitId,
    missing: !!circuitId && !circuits.some(c => c.id === circuitId),
    missingLabel: t('Selected heating circuit is missing'),
    options: circuits,
    emptyLabel: t('No heating circuit found'),
  });
  return html`<section class="target-panel" aria-label="${esc(t('Controller and heating circuit'))}">
    ${controllerSelect}
    ${circuitSelect}
    <button type="button" id="reload-registry" ${disabledIf(busy)}>${esc(t('Rediscover'))}</button>
    ${model.bindingError ? html`<p class="target-error" role="alert">${esc(model.bindingError)}</p>` : ''}
    ${model.registryError ? html`<p class="hint">${esc(t('Registry: '))}${esc(model.registryError)}</p>` : ''}
  </section>`;
}

/**
 * Selection with a label.
 *
 * @param {object} options The selection.
 * @param {string} options.id ID of the select element.
 * @param {string} options.label Label.
 * @param {boolean} options.disabled Whether the selection is disabled.
 * @param {string} options.selected Selected value.
 * @param {boolean} options.missing Whether the selected value is not in the options.
 * @param {string} options.missingLabel Label of a missing selected value.
 * @param {{ id: string, label: string }[]} options.options Options.
 * @param {string} options.emptyLabel Label without options.
 * @returns {string} The label with the select element.
 */
function targetSelect({ id, label, disabled, selected, missing, missingLabel, options, emptyLabel }) {
  const missingOption = missing ? html`<option value="${esc(selected)}" selected>${esc(missingLabel)}</option>` : '';
  const items = options.length
    ? options.map(o => option(o.id, o.label, o.id === selected)).join('')
    : html`<option>${esc(emptyLabel)}</option>`;
  return html`<label class="field">${esc(label)}
    <select id="${id}" aria-label="${esc(label)}" ${disabledIf(disabled)}>${missingOption}${items}</select>
  </label>`;
}

/**
 * Option of a select element.
 *
 * @param {string} value Value.
 * @param {string} label Label.
 * @param {boolean} selected Whether the option is selected.
 * @returns {string} The option element.
 */
function option(value, label, selected) {
  return html`<option value="${esc(value)}" ${selected ? 'selected' : ''}>${esc(label)}</option>`;
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
    ? html`<form id="unlock-form" class="unlock-form">
        <label class="field">${esc(t('Password'))}
          <input id="edit-password" type="password" autocomplete="current-password" required ${disabledIf(verifying)}>
        </label>
        <div class="buttons">
          <button type="button" id="confirm-unlock" class="primary" ${disabledIf(verifying)}>
            ${esc(verifying ? t('Verifying …') : t('Unlock editing'))}
          </button>
          <button type="button" id="cancel-unlock">${esc(t('Cancel'))}</button>
        </div>
        <span class="unlock-error" role="alert">${esc(model.error)}</span>
      </form>`
    : '';
  return html`<section class="edit-lock" aria-label="${esc(t('Password protection'))}">
    <div class="edit-lock-info">
      <ha-icon icon="mdi:${unlocked ? 'lock-open-outline' : 'lock-outline'}" aria-hidden="true"></ha-icon>
      <div><b>${esc(status)}</b><span>${esc(hint)}</span></div>
    </div>
    <button type="button" id="${unlocked ? 'lock-editor' : 'unlock-editor'}">
      ${esc(unlocked ? t('Lock') : t('Unlock'))}
    </button>
    ${form}
  </section>`;
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
  const text = t('{count} required KeEnergy entities are disabled. An administrator can enable the required entities for this heating circuit.', { count });
  return html`<div class="setup">
    <b>${esc(t('Enable editing'))}</b>
    <p>${esc(text)}</p>
    <button type="button" id="enable-editors" class="primary" ${disabledIf(!canEnable)}>
      ${esc(t('Enable required entities'))}
    </button>
  </div>`;
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
      <div><small>KEBA KEENERGY</small><h2>${esc(model.title)}</h2><p>${esc(model.mode)}</p></div>
      <span class="badge">${esc(model.selected || '—')}</span>
    </header>
    <div id="chart">${model.chart}</div>
    <div class="legend">
      <span><i class="line"></i><span id="curve-label">${esc(curveLabel(model.dirty, t))}</span></span>
      <span><i class="dot target"></i>${esc(t('Controller target'))}</span>
      <span><i class="dot actual"></i>${esc(t('Actual flow'))}</span>
      ${limitsLegend}
      <span><i class="dot interpolated"></i>${esc(t('Interpolated values'))}</span>
    </div>
    <p class="notice">${esc(notice)}${esc(t('The controller target is read separately from KeEnergy.'))}</p>
    <div id="message" class="notice" role="status">${esc(model.message)}</div>
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
  const { selected, options } = model;
  const selectLabel = esc(t('Curve table for this heating circuit'));
  const currentOption = selected && !options.includes(selected)
    ? html`<option value="" selected>${esc(t('Current: {name}', { name: selected }))}</option>`
    : '';
  const items = options.length
    ? options.map(o => option(o, o, o === selected)).join('')
    : html`<option>${esc(selected || t('No curves available'))}</option>`;
  const hint = t('Choose one of the heating tables (HC…) offered by the controller. Selecting a table assigns it to this heating circuit. A table can be shared by several circuits on the same controller.');
  return html`<aside>
    <h3>${esc(t('Select curve table'))}</h3>
    <label class="field">${selectLabel}
      <select id="curve-select" aria-label="${selectLabel}" ${disabledIf(model.curveSelectDisabled)}>
        ${currentOption}${items}
      </select>
    </label>
    <p class="hint">${esc(hint)}</p>
    <h3>${esc(t('Current readings'))}</h3>
    <div class="metrics">
      ${metric(t('Outdoor temperature'), model.readings.outdoor, '', 'outdoor')}
      ${metric(t('Target flow'), model.readings.target, 'target', 'target')}
      ${metric(t('Actual flow'), model.readings.actual, 'actual', 'actual')}
      ${metric(t('Points'), model.points.length, '', 'points')}
    </div>
    <h3>${esc(t('Day / night heating limits'))}</h3>
    <div class="limit-fields">${model.limits.map(limit => limitInput(limit, t)).join('')}</div>
    <button class="primary" id="save-settings" ${disabledIf(model.limitsDisabled)}>
      ${esc(t('Save heating limits'))}
    </button>
  </aside>`;
}

/**
 * Tile of a reading.
 *
 * @param {string} label Label.
 * @param {string | number} value Formatted value.
 * @param {string} cls Additional class.
 * @param {string} key Key of `data-live` for the live update.
 * @returns {string} The tile.
 */
function metric(label, value, cls, key) {
  return html`<div class="metric ${cls}"><span>${esc(label)}</span><b data-live="${key}">${esc(value)}</b></div>`;
}

/**
 * Input field of a heating limit.
 *
 * @param {LimitModel} model The field.
 * @param {Translate} t Translates the label.
 * @returns {string} The label with the input element.
 */
function limitInput(model, t) {
  const { key, min, max, step, value } = model;
  const attributes = [
    `data-setting="${key}"`,
    'type="number"',
    `step="${Number.isFinite(step) && step > 0 ? step : 'any'}"`,
    Number.isFinite(min) ? `min="${min}"` : '',
    Number.isFinite(max) ? `max="${max}"` : '',
    `value="${Number.isFinite(value) ? value : ''}"`,
    disabledIf(model.disabled),
  ];
  return `<label class="field">${esc(t(model.label))} (${esc(model.unit)})<input ${attributes.join(' ')}></label>`;
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
        <button type="button" id="reset" ${disabledIf(model.discardDisabled)}>${esc(t('Discard draft'))}</button>
        <button type="button" id="add-point" ${disabledIf(!ready || points.length >= POINT_LIMITS.count.max)}>
          ${esc(t('Add point'))}
        </button>
        <button type="button" id="save-points" class="primary" ${disabledIf(!ready)}>${esc(t('Save points'))}</button>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>${esc(t('Outdoor °C'))}</th><th>${esc(t('Flow °C'))}</th><th></th></tr></thead>
        <tbody>${pointRows(points, ready, t)}</tbody>
      </table>
    </div>
    ${setupDetails(model, t)}
    <p class="hint">${esc(t('KeEnergy heating curve · General version {version}', { version: model.version }))}</p>
  </section>`;
}

/**
 * Hints about missing entities, the config entry and the action of the integration.
 *
 * @param {CardModel} model What the card shows.
 * @param {Translate} t Translates the texts.
 * @returns {string} The details element, empty when everything is set up.
 */
function setupDetails(model, t) {
  const { missing } = model;
  if (!missing.length && !model.entryMissing && !model.pointServiceMissing) return '';
  const missingText = t('These entities are missing or do not yet provide values:');
  const entryText = t('Integration entry not found yet. Optionally set config_entry in the card.');
  const serviceText = t('The keba_keenergy.set_heating_curve_points action is unavailable. The integration must support editing curve points.');
  return html`<details open>
    <summary>${esc(t('Check entities / setup'))}</summary>
    ${missing.length ? html`<p>${esc(missingText)}</p>` : ''}
    <ul>${missing.map(id => html`<li><code>${esc(id)}</code></li>`).join('')}</ul>
    ${model.entryMissing ? html`<p>${esc(entryText)}</p>` : ''}
    ${model.pointServiceMissing ? html`<p>${esc(serviceText)}</p>` : ''}
    <button type="button" id="retry">${esc(t('Reload mapping'))}</button>
  </details>`;
}
