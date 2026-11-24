import { languageCode, translate } from './i18n.js';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { discoverControllers, loadRegistry } from './discovery.js';

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

class KeEnergyHeatingCurveEditor extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._controllers = []; this._revision = 0; }
  setConfig(config) {
    this._config = { ...config };
    this._revision++;
    this._render();
  }
  set hass(hass) {
    const before=languageCode(this._config,this._hass);this._hass=hass;
    if(before!==languageCode(this._config,hass)&&!this.shadowRoot.activeElement)this._render();
    if(!this._loaded&&!this._loading)this._load();
  }
  _t(text,params){return translate(languageCode(this._config,this._hass),text,params);}
  async _load() {
    this._loading = true;
    try { const { registry, devices } = await loadRegistry(this._hass,text=>this._t(text)); this._registry=registry;this._devices=devices;this._controllers=discoverControllers(registry,devices,text=>this._t(text)); }
    catch (error) { this._error = this._t('Automatische Auswahl nicht verfügbar: ') + (error.message || error); }
    finally { this._loaded = true; this._loading = false; if (!this.shadowRoot.activeElement) this._render(); }
  }
  _emit() {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } }, bubbles: true, composed: true }));
  }
  _change(key, value, redraw = false) {
    if (value === '' || value == null) delete this._config[key]; else this._config[key] = value;
    this._revision++;
    if (redraw) this._render();
    this._emit();
  }
  async _createPassword() {
    const one = this.shadowRoot.querySelector('#new-password'), two = this.shadowRoot.querySelector('#repeat-password');
    const message = this.shadowRoot.querySelector('#password-message');
    if (!one.value || one.value !== two.value) { message.textContent = this._t('Beide Kennwörter müssen ausgefüllt und gleich sein.'); return; }
    if (!globalThis.crypto?.getRandomValues) { message.textContent = this._t('Der Browser kann keinen sicheren Zufallswert erzeugen.'); return; }
    const revision = this._revision, bytes = new TextEncoder().encode(one.value), salt = crypto.getRandomValues(new Uint8Array(16));
    const button = this.shadowRoot.querySelector('#create-password'); button.disabled = true; one.value = ''; two.value = '';
    let derived;
    try {
      derived = await pbkdf2Async(sha256, bytes, salt, { c: 120000, dkLen: 32 });
      if (revision !== this._revision) { message.textContent = this._t('Konfiguration geändert. Kennwort bitte erneut setzen.'); return; }
      this._change('edit_password_hash', ['pbkdf2-sha256', 120000, hex(salt), hex(derived)].join('$'), true);
    } catch (error) { message.textContent = this._t('Kennwort konnte nicht eingerichtet werden: ') + (error.message || error); }
    finally { bytes.fill(0); derived?.fill(0); button.disabled = false; }
  }
  _render() {
    if (!this._config) return;
    const c = this._config;
    if(this._registry)this._controllers=discoverControllers(this._registry,this._devices,text=>this._t(text));
    const selected = this._controllers.find(controller => controller.id === c.config_entry || !c.config_entry && String(c.serial || '') === controller.serial);
    const circuits = selected?.circuits || [];
    const field = (label, key, type = 'text', extra = '') => `<label>${label}<input data-config="${key}" type="${type}" value="${esc(c[key])}" ${extra}></label>`;
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;color:var(--primary-text-color);font:14px var(--primary-font-family,Arial)}*{box-sizing:border-box}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}label{display:grid;gap:6px;margin:12px 0;font-size:12px}
      input,select,button{font:inherit;color:var(--primary-text-color);background:var(--card-background-color,#fff);padding:10px;border:1px solid var(--divider-color,#ccc);border-radius:8px;min-width:0}
      button{cursor:pointer;margin:6px 6px 6px 0}p{color:var(--secondary-text-color);font-size:12px;line-height:1.5}summary{cursor:pointer}#password-message{color:var(--error-color,#a44)}
      @media(max-width:450px){.grid{grid-template-columns:1fr}}
      </style>${field(this._t('Titel'), 'title')}
      <label>${esc(this._t("Sprache"))}<select id="config-language" aria-label="${esc(this._t("Sprache"))}">${['auto','de','en'].map(value=>`<option value="${value}" ${(c.language||'auto')===value?'selected':''}>${esc(this._t(value==='auto'?'Automatisch (Home Assistant)':value==='de'?'Deutsch':'Englisch'))}</option>`).join('')}</select></label>
      <label>${esc(this._t("Regler fest zuordnen"))}<select id="config-controller" aria-label="${esc(this._t("Regler fest zuordnen"))}"><option value="">${esc(this._t("Automatisch · im Dashboard auswählbar"))}</option>${this._controllers.map(controller => `<option value="${esc(controller.id)}" ${selected?.id === controller.id ? 'selected' : ''}>${esc(controller.label)}</option>`).join('')}</select></label>
      <label>${esc(this._t("Heizkreis fest zuordnen"))}<select id="config-circuit" aria-label="${esc(this._t("Heizkreis fest zuordnen"))}"><option value="">${esc(this._t("Automatisch · im Dashboard auswählbar"))}</option>${circuits.map(circuit => `<option value="${esc(circuit.id)}" ${String(c.circuit || '') === circuit.id ? 'selected' : ''}>${esc(circuit.label)}</option>`).join('')}${c.circuit && !circuits.some(circuit => circuit.id === String(c.circuit)) ? `<option value="${esc(c.circuit)}" selected>${esc(this._t("Heizkreis"))} ${esc(c.circuit)}</option>` : ''}</select></label>
      <p>${esc(this._t("Ohne feste Zuordnung werden Regler und Heizkreis direkt in der Karte gewählt. Das Umschalten der Ansicht sendet keine Befehle."))}</p>
      ${this._error ? `<p>${esc(this._error)}</p>` : ''}
      <details><summary>${esc(this._t("Vorlaufbegrenzungen im Diagramm"))}</summary><p>${esc(this._t("Leer lassen für die unveränderte Tabelle. Diese Werte begrenzen nur die Darstellung und werden nicht an den Regler übertragen."))}</p><div class="grid">${field(this._t('Anzeige Minimum (°C)'), 'flow_min', 'number', 'min="10" max="90" step="any"')}${field(this._t('Anzeige Maximum (°C)'), 'flow_max', 'number', 'min="10" max="90" step="any"')}</div></details>
      <details><summary>${esc(this._t("Kennwortschutz"))} ${c.edit_password_hash ? this._t('· eingerichtet') : this._t('· optional')}</summary><p>${esc(this._t("Jeder richtet sein eigenes Kennwort ein. Nur der Prüfwert wird in der Kartenkonfiguration gespeichert. Der Schutz gilt für diese Kartenoberfläche; Home-Assistant-Berechtigungen gelten weiterhin."))}</p>
      <div class="grid"><label>${esc(this._t("Neues Kennwort"))}<input id="new-password" type="password" autocomplete="new-password"></label><label>${esc(this._t("Kennwort wiederholen"))}<input id="repeat-password" type="password" autocomplete="new-password"></label></div>
      <button type="button" id="create-password">${esc(this._t("Kennwort einrichten"))}</button>${c.edit_password_hash ? `<button type="button" id="remove-password">${esc(this._t("Kennwortschutz entfernen"))}</button>` : ''}
      <p id="password-message" role="status"></p>${field(this._t('Automatisch sperren nach Minuten'), 'auto_lock_minutes', 'number', 'min="1" max="60" step="1"')}</details>
      <p>${esc(this._t("Weitere Optionen und manuelle Entitätszuordnungen sind im YAML-Editor möglich."))}</p>`;
    this.shadowRoot.querySelectorAll('[data-config]').forEach(input => input.addEventListener('change', () => {
      const value = input.type === 'number' && input.value !== '' ? Number(input.value) : input.value;
      this._change(input.dataset.config, value);
    }));
    this.shadowRoot.querySelector('#config-language').addEventListener('change',event=>this._change('language',event.target.value,true));
    this.shadowRoot.querySelector('#config-controller').addEventListener('change', event => {
      delete this._config.serial; delete this._config.circuit;
      this._change('config_entry', event.target.value, true);
    });
    this.shadowRoot.querySelector('#config-circuit').addEventListener('change', event => this._change('circuit', event.target.value));
    this.shadowRoot.querySelector('#create-password').addEventListener('click', () => this._createPassword());
    this.shadowRoot.querySelector('#remove-password')?.addEventListener('click', () => this._change('edit_password_hash', '', true));
  }
}
if (!customElements.get('keba-keenergy-heizkurve-editor')) customElements.define('keba-keenergy-heizkurve-editor', KeEnergyHeatingCurveEditor);
