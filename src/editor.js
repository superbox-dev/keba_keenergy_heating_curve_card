import { languageCode, translate } from './i18n.js';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { discoverControllers, loadRegistry } from './discovery.js';
import { AXIS_LIMITS, DEFAULT_AXIS_STEP, INTERMEDIATE_STEP, MIN_AXIS_STEP } from './chart-axis.js';

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));
const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

class KeEnergyHeatingCurveEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._controllers = [];
    this._revision = 0;
  }

  setConfig(config) {
    this._config = { ...config };
    this._revision++;
    this._render();
  }

  set hass(hass) {
    const before = languageCode(this._config, this._hass);
    this._hass = hass;
    if (before !== languageCode(this._config, hass) && !this.shadowRoot.activeElement) this._render();
    if (!this._loaded && !this._loading) this._load();
  }

  _t(text, params) { return translate(languageCode(this._config, this._hass), text, params); }
  async _load() {
    this._loading = true;
    try {
      const { registry, devices } = await loadRegistry(this._hass, text => this._t(text));
      this._registry = registry;
      this._devices = devices;
      this._controllers = discoverControllers(registry, devices, text => this._t(text));
    } catch (error) { this._error = this._t('Automatic selection unavailable: ') + (error.message || error); } finally {
      this._loaded = true;
      this._loading = false;
      if (!this.shadowRoot.activeElement) this._render();
    }
  }

  _emit() {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } }, bubbles: true, composed: true }));
  }

  _change(key, value, redraw = false) {
    if (value === '' || value == null) delete this._config[key]; else
      this._config[key] = value;
    this._revision++;
    if (redraw) this._render();
    this._emit();
  }

  async _createPassword() {
    const one = this.shadowRoot.querySelector('#new-password'), two = this.shadowRoot.querySelector('#repeat-password');
    const message = this.shadowRoot.querySelector('#password-message');
    if (!one.value || one.value !== two.value) {
      message.textContent = this._t('Both passwords must be filled in and match.');
      return;
    }
    if (!globalThis.crypto?.getRandomValues) {
      message.textContent = this._t('The browser cannot generate secure random values.');
      return;
    }
    const revision = this._revision, bytes = new TextEncoder().encode(one.value);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const button = this.shadowRoot.querySelector('#create-password');
    button.disabled = true;
    one.value = '';
    two.value = '';
    let derived;
    try {
      derived = await pbkdf2Async(sha256, bytes, salt, { c: 120000, dkLen: 32 });
      if (revision !== this._revision) {
        message.textContent = this._t('Configuration changed. Please set the password again.');
        return;
      }
      this._change('edit_password_hash', ['pbkdf2-sha256', 120000, hex(salt), hex(derived)].join('$'), true);
    } catch (error) { message.textContent = this._t('Could not set the password: ') + (error.message || error); } finally {
      bytes.fill(0);
      derived?.fill(0);
      button.disabled = false;
    }
  }

  _render() {
    if (!this._config) return;
    const c = this._config;
    if (this._registry) this._controllers = discoverControllers(this._registry, this._devices, text => this._t(text));
    const selected = this._controllers.find(controller => controller.id === c.config_entry || (!c.config_entry && String(c.serial || '') === controller.serial));
    const circuits = selected?.circuits || [];
    const field = (label, key, type = 'text', extra = '') => {
      const value = type === 'number' ? String(c[key] ?? '').replace(',', '.') : c[key];
      return `<label>${esc(label)}<input data-config="${key}" type="${type}" value="${esc(value)}" ${extra}></label>`;
    };
    const axisFields = (axis, title) => {
      const { min, max } = AXIS_LIMITS[axis];
      const bounds = `min="${min}" max="${max}" step="0.01" placeholder="${esc(this._t('Automatic'))}"`;
      return `<fieldset><legend>${esc(title)}</legend><div class="grid axis-fields">
        ${field(this._t('Minimum (°C)'), `${axis}_min`, 'number', bounds)}
        ${field(this._t('Maximum (°C)'), `${axis}_max`, 'number', bounds)}
        ${field(this._t('Grid interval (°C)'), `${axis}_step`, 'number', `min="${MIN_AXIS_STEP}" max="${max - min}" step="0.01" placeholder="${DEFAULT_AXIS_STEP}"`)}
      </div></fieldset>`;
    };
    const axesOpen = this.shadowRoot.querySelector('#chart-axes')?.open;
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;color:var(--primary-text-color);font:14px var(--primary-font-family,Arial)}*{box-sizing:border-box}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}label{display:grid;gap:6px;margin:12px 0;font-size:12px}
      input,select,button{font:inherit;color:var(--primary-text-color);background:var(--card-background-color,#fff);padding:10px;border:1px solid var(--divider-color,#ccc);border-radius:8px;min-width:0}
      button{cursor:pointer;margin:6px 6px 6px 0}p{color:var(--secondary-text-color);font-size:12px;line-height:1.5}summary{cursor:pointer}#password-message{color:var(--error-color,#a44)}
      fieldset{min-width:0;border:1px solid var(--divider-color,#ccc);border-radius:8px;margin:10px 0;padding:0 10px}legend{font-size:12px}.axis-fields{grid-template-columns:repeat(3,minmax(0,1fr))}
      @media(max-width:450px){.grid{grid-template-columns:1fr}}
      </style>${field(this._t('Title'), 'title')}
      <label>${esc(this._t('Language'))}<select id="config-language" aria-label="${esc(this._t('Language'))}">${['auto', 'de', 'en'].map(value => `<option value="${value}" ${(c.language || 'auto') === value ? 'selected' : ''}>${esc(this._t(value === 'auto' ? 'Automatic (Home Assistant)' : value === 'de' ? 'German' : 'English'))}</option>`).join('')}</select></label>
      <label>${esc(this._t('Pin controller'))}<select id="config-controller" aria-label="${esc(this._t('Pin controller'))}"><option value="">${esc(this._t('Automatic · selectable in the dashboard'))}</option>${this._controllers.map(controller => `<option value="${esc(controller.id)}" ${selected?.id === controller.id ? 'selected' : ''}>${esc(controller.label)}</option>`).join('')}</select></label>
      <label>${esc(this._t('Pin heating circuit'))}<select id="config-circuit" aria-label="${esc(this._t('Pin heating circuit'))}"><option value="">${esc(this._t('Automatic · selectable in the dashboard'))}</option>${circuits.map(circuit => `<option value="${esc(circuit.id)}" ${String(c.circuit || '') === circuit.id ? 'selected' : ''}>${esc(circuit.label)}</option>`).join('')}${c.circuit && !circuits.some(circuit => circuit.id === String(c.circuit)) ? `<option value="${esc(c.circuit)}" selected>${esc(this._t('Heating circuit'))} ${esc(c.circuit)}</option>` : ''}</select></label>
      <p>${esc(this._t('Without a fixed mapping, select the controller and heating circuit in the card. Switching the view sends no commands.'))}</p>
      ${this._error ? `<p>${esc(this._error)}</p>` : ''}
      <details id="chart-axes" ${axesOpen ? 'open' : ''}>
        <summary>${esc(this._t('Chart axes'))}</summary>
        <p>${esc(this._t('Empty bounds are set automatically. The default grid interval is 5 °C. These settings only change the visible chart range and grid.'))}</p>
        ${axisFields('x', this._t('X-axis · Outdoor temperature'))}
        ${axisFields('y', this._t('Y-axis · Flow temperature'))}
        <fieldset><legend>${esc(this._t('Interpolated values'))}</legend>
          ${field(this._t('Interpolated value interval on the X-axis (°C)'), 'intermediate_step', 'number', `min="${INTERMEDIATE_STEP.min}" max="${INTERMEDIATE_STEP.max}" step="0.01" placeholder="${INTERMEDIATE_STEP.default}"`)}
        </fieldset>
      </details>
      <details><summary>${esc(this._t('Chart flow limits'))}</summary><p>${esc(this._t('Leave empty to show the unmodified table. These values limit the display only and are not sent to the controller.'))}</p><div class="grid">${field(this._t('Display minimum (°C)'), 'flow_min', 'number', 'min="10" max="90" step="any"')}${field(this._t('Display maximum (°C)'), 'flow_max', 'number', 'min="10" max="90" step="any"')}</div></details>
      <details><summary>${esc(this._t('Password protection'))} ${c.edit_password_hash ? this._t('· configured') : this._t('· optional')}</summary><p>${esc(this._t('Set your own password. Only the verifier is stored in the card configuration. Protection applies to this card interface; Home Assistant permissions still apply.'))}</p>
      <div class="grid"><label>${esc(this._t('New password'))}<input id="new-password" type="password" autocomplete="new-password"></label><label>${esc(this._t('Repeat password'))}<input id="repeat-password" type="password" autocomplete="new-password"></label></div>
      <button type="button" id="create-password">${esc(this._t('Set password'))}</button>${c.edit_password_hash ? `<button type="button" id="remove-password">${esc(this._t('Remove password protection'))}</button>` : ''}
      <p id="password-message" role="status"></p>${field(this._t('Auto-lock after minutes'), 'auto_lock_minutes', 'number', 'min="1" max="60" step="1"')}</details>
      <p>${esc(this._t('Additional options and manual entity mappings are available in the YAML editor.'))}</p>`;
    this.shadowRoot.querySelectorAll('[data-config]').forEach(input => input.addEventListener('change', () => {
      if (input.closest('#chart-axes') && !input.reportValidity()) return;
      const value = input.type === 'number' && input.value !== '' ? Number(input.value) : input.value;
      this._change(input.dataset.config, value);
    }));
    this.shadowRoot.querySelector('#config-language').addEventListener('change', event => this._change('language', event.target.value, true));
    this.shadowRoot.querySelector('#config-controller').addEventListener('change', (event) => {
      delete this._config.serial;
      delete this._config.circuit;
      this._change('config_entry', event.target.value, true);
    });
    this.shadowRoot.querySelector('#config-circuit').addEventListener('change', event => this._change('circuit', event.target.value));
    this.shadowRoot.querySelector('#create-password').addEventListener('click', () => this._createPassword());
    this.shadowRoot.querySelector('#remove-password')?.addEventListener('click', () => this._change('edit_password_hash', '', true));
  }
}
if (!customElements.get('keba-keenergy-heating-curve-card-editor')) customElements.define('keba-keenergy-heating-curve-card-editor', KeEnergyHeatingCurveEditor);
