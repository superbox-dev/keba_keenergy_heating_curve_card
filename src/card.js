import { languageCode, translate, formatNumber } from './i18n.js';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { FIELDS as ENTITY_FIELDS, parseEntity, discoverControllers, loadRegistry } from './discovery.js';
import './editor.js';
/* KEBA KeEnergy Heizkurve 1.0.2. Independent name allows the personal card to coexist. */
(() => {
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const numeric=v=>v==null||String(v).trim()===''?NaN:Number(String(v).replace(',','.'));
  const good=s=>!!s&&!['unknown','unavailable',''].includes(s.state);
  const FIELDS={limitDay:['heating_limit_day','Heizgrenze Tag','°C'],limitNight:['heating_limit_night','Heizgrenze Nacht','°C']};
  let cardSequence=0;
  const interpolate=(outdoor,points)=>{
    if(!points.length)return NaN;
    if(points.length===1)return points[0].flow;
    let i=points.findIndex((p,index)=>index<points.length-1&&outdoor<=points[index+1].outdoor);
    if(i<0)i=points.length-2;
    const a=points[i],b=points[i+1];
    return a.flow+(outdoor-a.outdoor)/(b.outdoor-a.outdoor)*(b.flow-a.flow);
  };
  class KeEnergyHeatingCurveCard extends HTMLElement {
    constructor(){
      super();this.attachShadow({mode:'open'});this._edits={};this._draft=null;this._busy=false;this._message='';this._map={};this._registry=[];this._pendingRender=false;this._selectInteracting=false;
      this._unlockedUntil=0;this._lockTimer=null;this._lockRevision=0;this._unlockOpen=false;this._verifying=false;this._unlockError='';
      this._viewKey=null;this._plotId='keenergy-plot-'+(++cardSequence);this._discoveryRevision=0;this._controllers=[];this._controllerId='';this._circuitId='';
      this._visibilityHandler=()=>{if(this._passwordCheck&&globalThis.document?.hidden)this._lock(this._t('Bearbeitung gesperrt.'));};
      const flush=()=>queueMicrotask(()=>{if(this._pendingRender&&!this._editing())this._render();});
      this.shadowRoot.addEventListener('focusout',event=>{
        // A button click must reach its handler before a pending redraw replaces that button.
        if(event.relatedTarget&&this.shadowRoot.contains(event.relatedTarget)&&event.relatedTarget.matches('button'))return;
        flush();
      });
      this.shadowRoot.addEventListener('click',flush);
    }
    setConfig(config){
      if(config.entities&&(typeof config.entities!=='object'||Array.isArray(config.entities)))throw Error(this._t('entities muss eine Zuordnung sein.'));
      this._config={title:'',language:'auto',serial:'',circuit:'',flow_min:null,flow_max:null,edit_password_hash:'',auto_lock_minutes:5,...config};
      if(!['auto','de','en'].includes(this._config.language))throw Error(this._t('language muss auto, de oder en sein.'));
      for(const key of ['serial','circuit','config_entry'])this._config[key]=String(this._config[key]??'').trim();
      if(this._config.circuit&&!/^[1-9]\d*$/.test(this._config.circuit))throw Error(this._t('circuit muss eine Heizkreisnummer ab 1 sein.'));
      for(const [key,id] of Object.entries(this._config.entities||{})){
        const field=Object.values(ENTITY_FIELDS).find(f=>f[2]===key);
        if(!field||typeof id!=='string'||!id.startsWith(field[0]+'.'))throw Error(this._t('Ungültige Entitätszuordnung: ')+key);
      }
      const token=String(this._config.edit_password_hash||'').match(/^pbkdf2-sha256\$(\d+)\$([0-9a-f]{32})\$([0-9a-f]{64})$/i);
      if(this._config.edit_password_hash&&(!token||Number(token[1])<100000||Number(token[1])>1000000))throw Error(this._t('edit_password_hash muss ein gültiger PBKDF2-SHA256-Prüfwert sein. Im visuellen Editor kann er erstellt werden.'));
      this._passwordCheck=token?{iterations:Number(token[1]),salt:token[2],hash:token[3].toLowerCase()}:null;
      this._config.auto_lock_minutes=numeric(this._config.auto_lock_minutes);
      if(!Number.isFinite(this._config.auto_lock_minutes)||this._config.auto_lock_minutes<1||this._config.auto_lock_minutes>60)throw Error(this._t('auto_lock_minutes muss zwischen 1 und 60 Minuten liegen.'));
      clearTimeout(this._lockTimer);this._lockTimer=null;this._unlockedUntil=0;this._lockRevision++;this._unlockOpen=false;this._verifying=false;this._unlockError='';
      for(const key of ['flow_min','flow_max']){
        this._config[key]=this._config[key]===null||this._config[key]===''?null:numeric(this._config[key]);
        if(this._config[key]!==null&&(!Number.isFinite(this._config[key])||this._config[key]<10||this._config[key]>90))throw Error(this._t("{key} muss zwischen 10 und 90 °C liegen oder leer sein.",{key}));
      }
      if(this._config.flow_min!==null&&this._config.flow_max!==null&&this._config.flow_min>=this._config.flow_max)throw Error(this._t('flow_min muss kleiner als flow_max sein.'));
      this._discoveryRevision++;this._controllers=[];this._registry=[];this._controllerId='';this._circuitId='';this._bindingError='';this._registryError='';
      this._map={};this._entryId=this._config.config_entry||null;this._discovered=false;this._discovering=false;
      this._message='';this._draft=null;this._edits={};this._loadingCurve=null;this._pendingRender=false;this._selectInteracting=false;this._viewKey=null;this._render(true);this._discover();
    }
    set hass(hass){
      const oldLanguage=languageCode(this._config,this._hass);
      this._hass=hass;
      if(oldLanguage!==languageCode(this._config,hass)){
        this._message='';this._unlockError='';
        if(this._registry.length){this._controllers=discoverControllers(this._registry,this._devices||[],text=>this._t(text));this._applySelection();}
      }
      if(this._loadingCurve&&!this._busy){const id=this._ids();if(this._state(id.curve)?.state===this._loadingCurve&&this._state(id.select)?.state===this._loadingCurve)this._loadingCurve=null;}
      if(this._draft?.saved&&this._draft.name===this._selected()&&JSON.stringify(this._draft.points)===JSON.stringify(this._readPoints().sort((a,b)=>a.outdoor-b.outdoor)))this._draft=null;
      this._render();this._discover();
    }
    _t(text,params){return translate(languageCode(this._config,this._hass),text,params);}
    _number(value,options){return formatNumber(value,this._config,this._hass,options);}
    _fmt(value){return Number.isFinite(value)?this._number(value)+' °C':'—';}
    getCardSize(){return 11;}
    getGridOptions(){return {columns:'full',min_columns:6};}
    static getStubConfig(){return {};}
    static getConfigElement(){return document.createElement('keba-keenergy-heizkurve-editor');}
    connectedCallback(){globalThis.document?.addEventListener('visibilitychange',this._visibilityHandler);}
    disconnectedCallback(){globalThis.document?.removeEventListener('visibilitychange',this._visibilityHandler);if(this._passwordCheck)this._lock(this._t('Bearbeitung gesperrt.'));}
    _canEdit(){return !this._passwordCheck||this._unlockedUntil>Date.now();}
    _requireEdit(){if(this._bindingError){this._notice(this._bindingError);return false;}if(this._canEdit())return true;this._notice(this._t('Einstellungen gesperrt. Bitte mit Kennwort entsperren.'));return false;}
    _touchEdit(){
      if(!this._passwordCheck||!this._canEdit())return;
      this._unlockedUntil=Date.now()+this._config.auto_lock_minutes*60000;
      clearTimeout(this._lockTimer);
      this._lockTimer=setTimeout(()=>this._lock(this._t('Nach Inaktivität automatisch gesperrt. Ungespeicherte Änderungen verworfen.')),this._config.auto_lock_minutes*60000);
    }
    _lock(message=this._t('Bearbeitung gesperrt. Ungespeicherte Änderungen verworfen.')){
      clearTimeout(this._lockTimer);this._lockTimer=null;this._unlockedUntil=0;this._lockRevision++;this._unlockOpen=false;this._verifying=false;this._unlockError='';
      this._draft=null;this._edits={};this._selectInteracting=false;this._message=message;this._render(true);
    }
    _openUnlock(){this._unlockOpen=true;this._unlockError='';this._render(true);queueMicrotask(()=>this.shadowRoot.querySelector('#edit-password')?.focus());}
    _submitUnlock(event){
      event?.preventDefault?.();event?.stopPropagation?.();
      if(this._verifying)return;
      const input=this.shadowRoot.querySelector('#edit-password'),password=input?.value||'';
      if(!password){this._unlockError=this._t('Bitte Kennwort eingeben.');this._render(true);queueMicrotask(()=>this.shadowRoot.querySelector('#edit-password')?.focus());return;}
      if(input)input.value='';
      return this._unlock(password);
    }
    async _unlock(password){
      if(this._verifying||!this._passwordCheck)return false;
      const revision=this._lockRevision,check=this._passwordCheck,bytes=new TextEncoder().encode(String(password));
      this._verifying=true;this._unlockError='';this._render(true);let derived;
      try{
        const salt=Uint8Array.from(check.salt.match(/../g),v=>parseInt(v,16));
        derived=await pbkdf2Async(sha256,bytes,salt,{c:check.iterations,dkLen:32});
        if(revision!==this._lockRevision)return false;
        const expected=Uint8Array.from(check.hash.match(/../g),v=>parseInt(v,16));let difference=0;
        for(let i=0;i<expected.length;i++)difference|=derived[i]^expected[i];
        if(difference){this._unlockError=this._t('Kennwort ist nicht korrekt.');return false;}
        this._unlockedUntil=Date.now()+this._config.auto_lock_minutes*60000;this._unlockOpen=false;
        this._message=this._t('Bearbeitung freigegeben.');this._touchEdit();return true;
      }catch(error){if(revision===this._lockRevision)this._unlockError=this._t('Kennwortprüfung fehlgeschlagen. Bitte erneut versuchen.');return false;}
      finally{
        bytes.fill(0);derived?.fill(0);
        if(revision===this._lockRevision){this._verifying=false;this._render(true);if(this._unlockOpen)queueMicrotask(()=>this.shadowRoot.querySelector('#edit-password')?.focus());}
      }
    }
    _lockPanel(){
      if(!this._passwordCheck)return '';
      const unlocked=this._canEdit();
      return `<section class="edit-lock" aria-label="${esc(this._t("Kennwortschutz"))}"><div class="edit-lock-info"><ha-icon icon="mdi:${unlocked?'lock-open-outline':'lock-outline'}" aria-hidden="true"></ha-icon><div><b>${unlocked?this._t('Einstellungen freigegeben'):this._t('Einstellungen gesperrt')}</b><span>${unlocked?this._t("Automatische Sperre nach {minutes} Minuten ohne Bearbeitung.",{minutes:this._config.auto_lock_minutes}):this._t('Zum Ändern von Kurventabelle, Punkten und Heizgrenzen entsperren.')}</span></div></div><button type="button" id="${unlocked?'lock-editor':'unlock-editor'}">${unlocked?this._t('Sperren'):this._t('Entsperren')}</button>${this._unlockOpen&&!unlocked?`<form id="unlock-form" class="unlock-form"><label class="field">${esc(this._t("Kennwort"))}<input id="edit-password" type="password" autocomplete="current-password" required ${this._verifying?'disabled':''}></label><div class="buttons"><button type="button" id="confirm-unlock" class="primary" ${this._verifying?'disabled':''}>${this._verifying?this._t('Wird geprüft …'):this._t('Bearbeitung freigeben')}</button><button type="button" id="cancel-unlock">${esc(this._t("Abbrechen"))}</button></div><span class="unlock-error" role="alert">${esc(this._unlockError)}</span></form>`:''}</section>`;
    }
    _ids(){
      return Object.fromEntries(Object.keys(ENTITY_FIELDS).map(key=>[key,this._config.entities?.[ENTITY_FIELDS[key][2]]||this._map[key]||'']));
    }
    _state(id){return this._hass?.states?.[id];}
    _toCelsius(id,value,delta=false){const unit=this._state(id)?.attributes?.unit_of_measurement;return unit==='°F'?(value-(delta?0:32))/1.8:unit==='K'?value-(delta?0:273.15):value;}
    _fromCelsius(id,value){const unit=this._state(id)?.attributes?.unit_of_measurement;return unit==='°F'?value*1.8+32:unit==='K'?value+273.15:value;}
    _num(id){return good(this._state(id))?this._toCelsius(id,numeric(this._state(id).state)):NaN;}
    _numberMeta(id){const a=this._state(id)?.attributes||{};return {min:this._toCelsius(id,numeric(a.min)),max:this._toCelsius(id,numeric(a.max)),step:this._toCelsius(id,numeric(a.step),true)};}
    _editing(){return this._unlockOpen||this._selectInteracting||!!this.shadowRoot.activeElement?.matches('input, select');}
    async _discover(){
      if(!this._hass||!this._config||this._discovered||this._discovering)return;this._discovering=true;
      const revision=this._discoveryRevision;
      try{
        const {registry,devices}=await loadRegistry(this._hass,text=>this._t(text));
        if(revision!==this._discoveryRevision)return;
        this._registry=registry;this._devices=devices;this._controllers=discoverControllers(registry,devices,text=>this._t(text));this._registryError='';this._applySelection();
      }catch(error){
        if(revision!==this._discoveryRevision)return;
        this._registryError=error.message||String(error);this._applySelection();
      }finally{if(revision===this._discoveryRevision){this._discovered=true;this._discovering=false;this._render();}}
    }
    _applySelection(){
      const cfg=this._config,explicit=cfg.entities||{};
      const anchors=Object.entries(explicit).filter(([key])=>!['outdoor_temperature','flow_temperature','flow_setpoint'].includes(key))
        .map(([,id])=>this._registry.find(e=>e.entity_id===id)).filter(Boolean);
      const entries=[...new Set(anchors.map(e=>e.config_entry_id).filter(Boolean))];
      this._bindingError='';this._map={};this._entryId=null;
      if(entries.length>1){this._bindingError=this._t('Die Steuerungs-Entitäten stammen aus verschiedenen Reglern. Zuordnung in der Karte prüfen.');return;}
      const entryPin=cfg.config_entry||entries[0]||'';
      const available=this._controllers.filter(c=>(!entryPin||c.id===entryPin)&&(!cfg.serial||c.serial===cfg.serial));
      const controller=this._controllerId?available.find(c=>c.id===this._controllerId):available[0];
      if(!controller){
        // A manual mapping remains possible when registry reading is forbidden.
        if(this._registryError&&cfg.config_entry&&explicit.curve_sensor){this._entryId=cfg.config_entry;return;}
        this._bindingError=this._controllers.length?this._t('Der konfigurierte KeEnergy-Regler wurde nicht gefunden. Kartenkonfiguration prüfen.'):this._registryError?this._t('KeEnergy-Zuordnung nicht lesbar. Als Administrator öffnen oder Entitäten und config_entry manuell zuordnen.'):this._t('Kein KeEnergy-Heizkreis mit Heizkurventabelle gefunden.');
        return;
      }
      if(entries.length&&controller.id!==entries[0]){this._bindingError=this._t('config_entry und Entitätszuordnung gehören zu verschiedenen Reglern.');return;}
      const circuits=[...new Set(anchors.map(parseEntity).filter(p=>p?.circuit).map(p=>p.circuit))];
      if(circuits.length>1){this._bindingError=this._t('Die Steuerungs-Entitäten gehören zu verschiedenen Heizkreisen.');return;}
      const circuitPin=cfg.circuit||circuits[0]||'';
      if(cfg.circuit&&circuits.length&&cfg.circuit!==circuits[0]){this._bindingError=this._t('circuit und Entitätszuordnung gehören zu verschiedenen Heizkreisen.');return;}
      const wantedCircuit=circuitPin||this._circuitId;
      const circuit=wantedCircuit?controller.circuits.find(c=>c.id===wantedCircuit):controller.circuits[0];
      this._controllerId=controller.id;this._entryId=controller.id;
      if(!circuit){this._bindingError=this._t('Der gewählte Heizkreis wurde an diesem Regler nicht gefunden.');return;}
      this._circuitId=circuit.id;this._map={...circuit.map};
      const unresolved=circuit.ambiguous.filter(key=>!explicit[ENTITY_FIELDS[key][2]]);
      if(unresolved.length)this._bindingError=this._t("Mehrdeutige Entitäten: {keys}. Bitte entities ausdrücklich zuordnen.",{keys:unresolved.join(', ')});
      for(const anchor of anchors){if(anchor.platform!=='keba_keenergy'){this._bindingError=this._t('Steuerungs-Entitäten müssen aus keba_keenergy stammen.');break;}}
    }
    _targetPanel(){
      const controller=this._controllers.find(c=>c.id===this._controllerId),circuits=controller?.circuits||[];
      const pinned=!!(this._config.config_entry||this._config.serial||Object.keys(this._config.entities||{}).length);
      return `<section class="target-panel" aria-label="${esc(this._t("Regler und Heizkreis"))}"><label class="field">${esc(this._t("Regler"))}<select id="controller-select" aria-label="${esc(this._t("Regler"))}" ${this._busy||pinned||this._controllers.length<2?'disabled':''}>${this._controllerId&&!controller?`<option value="${esc(this._controllerId)}" selected>${esc(this._t("Gewählter Regler fehlt"))}</option>`:''}${this._controllers.length?this._controllers.map(c=>`<option value="${esc(c.id)}" ${c.id===this._controllerId?'selected':''}>${esc(c.label)}</option>`).join(''):`<option>${esc(this._t("Kein Regler gefunden"))}</option>`}</select></label><label class="field">${esc(this._t("Heizkreis"))}<select id="circuit-select" aria-label="${esc(this._t("Heizkreis"))}" ${this._busy||!!this._config.circuit||Object.keys(this._config.entities||{}).length>0||circuits.length<2?'disabled':''}>${this._circuitId&&!circuits.some(c=>c.id===this._circuitId)?`<option value="${esc(this._circuitId)}" selected>${esc(this._t("Gewählter Heizkreis fehlt"))}</option>`:''}${circuits.length?circuits.map(c=>`<option value="${esc(c.id)}" ${c.id===this._circuitId?'selected':''}>${esc(c.label)}</option>`).join(''):`<option>${esc(this._t("Kein Heizkreis gefunden"))}</option>`}</select></label><button type="button" id="reload-registry" ${this._busy?'disabled':''}>${esc(this._t("Neu erkennen"))}</button>${this._bindingError?`<p class="target-error" role="alert">${esc(this._bindingError)}</p>`:''}${this._registryError?`<p class="hint">${esc(this._t("Verzeichnis: "))}${esc(this._registryError)}</p>`:''}</section>`;
    }
    _chooseTarget(kind,value){
      this._selectInteracting=false;
      if(this._busy||this._draft||Object.keys(this._edits).length){
        this._notice(this._t('Vor dem Regler- oder Heizkreiswechsel Änderungen speichern oder den Entwurf verwerfen.'));
        const el=this.shadowRoot.querySelector(kind==='controller'?'#controller-select':'#circuit-select');if(el)el.value=kind==='controller'?this._controllerId:this._circuitId;return;
      }
      if(kind==='controller'){
        if(this._config.config_entry||this._config.serial||Object.keys(this._config.entities||{}).length||!this._controllers.some(c=>c.id===value))return;
        this._controllerId=value;this._circuitId='';
      }else{
        if(this._config.circuit||Object.keys(this._config.entities||{}).length||!this._controllers.find(c=>c.id===this._controllerId)?.circuits.some(c=>c.id===value))return;
        this._circuitId=value;
      }
      this._loadingCurve=null;this._applySelection();this._message=this._t('Ansicht gewechselt. Es wurden keine Werte übertragen.');
      if(this._passwordCheck)this._lock(this._t('Ansicht gewechselt. Bearbeitung bitte erneut entsperren.'));else this._render(true);
    }
    _readPoints(){const raw=this._state(this._ids().curve)?.attributes?.points;return Array.isArray(raw)?raw.map(p=>({outdoor:numeric(p?.outdoor),flow:numeric(p?.flow)})):[];}
    _selected(){const ids=this._ids();return good(this._state(ids.select))?this._state(ids.select).state:good(this._state(ids.curve))?this._state(ids.curve).state:'';}
    _options(){const options=this._state(this._ids().select)?.attributes?.options;return Array.isArray(options)?options.filter(o=>typeof o==='string'&&o.startsWith('HC')):[];}
    _points(){return (this._draft?.name===this._selected()?this._draft.points:this._readPoints()).map(p=>({...p}));}
    _pointService(){return !!this._hass?.services?.keba_keenergy?.set_heating_curve_points;}
    _ready(){const ids=this._ids(),curve=this._state(ids.curve),options=this._options(),conflict=options.includes(curve?.state)&&curve.state!==this._selected();return !this._bindingError&&!!this._entryId&&this._pointService()&&!this._busy&&!this._loadingCurve&&this._selected().startsWith('HC')&&good(curve)&&Array.isArray(curve.attributes?.points)&&!conflict;}
    _disabledEditors(){
      const ids=Object.values(this._ids());
      return this._registry.filter(e=>e.platform==='keba_keenergy'&&e.config_entry_id===this._entryId&&e.disabled_by&&ids.includes(e.entity_id));
    }
    async _enableEditors(){
      if(this._busy||!this._requireEdit())return;this._touchEdit();
      if(!this._hass?.user?.is_admin){this._notice(this._t('Zum Aktivieren deaktivierter Entitäten als Administrator anmelden.'));return;}
      if(!this._discovered){await this._discover();}
      if(!this._requireEdit())return;
      const disabled=this._disabledEditors();
      if(!disabled.length){this._discovered=false;await this._discover();this._message=this._t('Entitäten neu eingelesen. Nicht vorhandene Werte müssen vom Regler unterstützt werden.');this._render();return;}
      this._busy=true;this._message=this._t('Bearbeitungs-Entitäten werden aktiviert …');this._render();let count=0;
      try{
        for(const entry of disabled){if(!this._canEdit())throw Error(this._t('Bearbeitung gesperrt. Erneut entsperren.'));await this._hass.callWS({type:'config/entity_registry/update',entity_id:entry.entity_id,disabled_by:null});entry.disabled_by=null;count++;}
        this._message=this._t("{count} Entitäten aktiviert. Home Assistant lädt die Werte; sie erscheinen nach dem nächsten Update.",{count});
      }catch(error){this._message=this._t("Aktivierung nach {count} Entitäten gestoppt: {error}. Als Administrator anmelden oder Entitäten in den KeEnergy-Einstellungen aktivieren.",{count,error:error.message||error});}
      finally{this._busy=false;this._discovered=false;this._render();await this._discover();}
    }
    _fieldValue(key){return Object.hasOwn(this._edits,key)?this._edits[key]:this._num(this._ids()[key]);}
    _input(key){
      const [,label,unit]=FIELDS[key],id=this._ids()[key],s=this._state(id),v=this._fieldValue(key),{min,max,step}=this._numberMeta(id);
      return `<label class="field">${esc(this._t(label))}${unit?' ('+unit+')':''}<input data-setting="${key}" type="number" step="${Number.isFinite(step)&&step>0?step:'any'}" ${Number.isFinite(min)?'min="'+min+'"':''} ${Number.isFinite(max)?'max="'+max+'"':''} value="${Number.isFinite(v)?v:''}" ${!good(s)||this._busy||!!this._bindingError||!this._canEdit()?'disabled':''}></label>`;
    }
    _chart(){
      const ids=this._ids(),valid=this._points().filter(p=>Number.isFinite(p.outdoor)&&Number.isFinite(p.flow)&&p.outdoor>=-40&&p.outdoor<=40&&p.flow>=10&&p.flow<=90).sort((a,b)=>a.outdoor-b.outdoor);
      const outside=this._num(ids.outdoor),target=this._num(ids.target),actual=this._num(ids.actual),day=this._fieldValue('limitDay'),night=this._fieldValue('limitNight');
      const minimum=this._config.flow_min??-Infinity,maximum=this._config.flow_max??Infinity,clamp=v=>Math.max(minimum,Math.min(maximum,v));
      const unique=valid.filter((p,i)=>!i||p.outdoor!==valid[i-1].outdoor);
      const lo=Math.min(-20,...valid.map(p=>p.outdoor)),hi=Math.max(30,...valid.map(p=>p.outdoor)),bottom=Math.floor(Math.min(15,Number.isFinite(minimum)?minimum:15,...valid.map(p=>clamp(p.flow)))/5)*5,top=Math.ceil(Math.max(60,Number.isFinite(maximum)?maximum:60,...valid.map(p=>clamp(p.flow)))/5)*5;
      const x=v=>58+(hi-v)/(hi-lo)*580,y=v=>344-(v-bottom)/(top-bottom)*320;
      let grid='',limits='',dots='',samples='',marks='';
      for(let v=Math.ceil(lo/5)*5;v<=hi;v+=5)grid+=`<line x1="${x(v)}" y1="24" x2="${x(v)}" y2="344" class="grid"/><text x="${x(v)}" y="365" text-anchor="middle">${v}</text>`;
      for(let v=Math.ceil(bottom/5)*5;v<=top;v+=5)grid+=`<line x1="58" y1="${y(v)}" x2="638" y2="${y(v)}" class="grid"/><text x="48" y="${y(v)+3}" text-anchor="end">${v}</text>`;
      [[day,'day',this._t('Tag'),16],[night,'night',this._t('Nacht'),34]].forEach(([v,cls,label,labelY])=>{if(Number.isFinite(v)&&v>=lo&&v<=hi)limits+=`<line x1="${x(v)}" y1="24" x2="${x(v)}" y2="344" class="limit ${cls}"/><text x="${Math.max(110,Math.min(585,x(v)))}" y="${labelY}" text-anchor="middle" class="limit-label">${esc(this._t("HG"))} ${label} ${esc(this._fmt(v))}</text>`;});
      [[minimum,'flow-min',this._t('Min')],[maximum,'flow-max',this._t('Max')]].filter(([v])=>Number.isFinite(v)).forEach(([v,cls,label])=>limits+=`<line x1="58" y1="${y(v)}" x2="638" y2="${y(v)}" class="limit ${cls}"/><text x="632" y="${y(v)-7}" text-anchor="end" class="flow-limit-label ${cls}">${label} ${esc(this._fmt(v))}</text>`);
      valid.forEach((p,i)=>{
        const shown=clamp(p.flow),px=x(p.outdoor),py=y(shown),anchor=px<=75?'start':px>=620?'end':'middle';
        const label=shown>minimum&&shown<maximum?`<text x="${px}" y="${Math.max(17,py-12)}" text-anchor="${anchor}" class="point-label">${this._number(shown,{minimumFractionDigits:1})}</text>`:'';
        dots+=`<g><title>${esc(this._t("P{index}: Außen {outdoor} °C · Tabelle {flow} °C · begrenzte Anzeige {shown} °C",{index:i+1,outdoor:this._number(p.outdoor,{minimumFractionDigits:1}),flow:this._number(p.flow,{minimumFractionDigits:1}),shown:this._number(shown,{minimumFractionDigits:1})}))}</title><circle cx="${px}" cy="${py}" r="2.8" class="point"/>${label}</g>`;
      });
      if(unique.length>1)for(let outdoor=Math.ceil(lo/5)*5;outdoor<=hi;outdoor+=5){
        const px=x(outdoor),shown=clamp(interpolate(outdoor,unique));
        // Saved points have priority; intermediate values stay visually quieter and do not crowd them.
        if(shown<=minimum||shown>=maximum||unique.some(p=>Math.abs(x(p.outdoor)-px)<25))continue;
        const py=y(shown);
        samples+=`<g><title>${esc(this._t("Zwischenwert bei {outdoor} °C außen: {flow} °C Vorlauf",{outdoor:this._number(outdoor),flow:this._number(shown,{minimumFractionDigits:1})}))}</title><circle cx="${px}" cy="${py}" r="1.7" class="sample-point"/><text x="${px}" y="${Math.max(17,py-9)}" text-anchor="middle" class="sample-label" data-outdoor="${outdoor}">${this._number(shown,{minimumFractionDigits:1})}</text></g>`;
      }
      [[target,'target'],[actual,'actual']].forEach(([v,cls])=>{if(Number.isFinite(outside)&&Number.isFinite(v)&&outside>=lo&&outside<=hi&&v>=bottom&&v<=top)marks+=`<circle cx="${x(outside)}" cy="${y(v)}" r="${cls==='target'?3.8:3}" class="${cls}"/>`;});
      const xs=[...new Set([lo,...unique.map(p=>p.outdoor),hi])].sort((a,b)=>a-b),crossings=[];
      if(unique.length)for(let i=0;i<xs.length-1;i++){
        const a=interpolate(xs[i],unique),b=interpolate(xs[i+1],unique);
        for(const limit of [minimum,maximum])if((a-limit)*(b-limit)<0)crossings.push(xs[i]+(limit-a)/(b-a)*(xs[i+1]-xs[i]));
      }
      const path=unique.length?[...new Set([...xs,...crossings])].sort((a,b)=>a-b).map((v,i)=>(i?'L':'M')+x(v)+','+y(clamp(interpolate(v,unique)))).join(' '):'';
      const dark=!!this._hass?.themes?.darkMode;
      const palette=`--curve-point-label:${dark?'#D8AE8B':'#9A6138'};--curve-sample-label:${dark?'#9BACB8':'#657B89'};--curve-line:${dark?'#65B4B0':'#278F89'}`;
      return `<svg viewBox="0 0 700 400" style="${palette}" aria-label="${esc(this._t("Gespeicherte Heizkurvenpunkte, berechnete Zwischenwerte und aktuelle Vorlauftemperaturen"))}" role="img"><defs><clipPath id="${this._plotId}" clipPathUnits="userSpaceOnUse"><rect x="58" y="24" width="580" height="320"/></clipPath></defs><rect x="58" y="24" width="580" height="320" rx="8" class="plot"/><g class="axes">${grid}</g>${limits}<path d="${path}" class="curve" clip-path="url(#${this._plotId})"/>${samples}${dots}${marks}<g class="axes"><text x="348" y="393" text-anchor="middle">${esc(this._t("Außentemperatur"))} °C</text><text x="15" y="184" text-anchor="middle" transform="rotate(-90 15 184)">${esc(this._t("Vorlauf °C"))}</text></g></svg>`;
    }
    _preview(){const el=this.shadowRoot.querySelector('#chart');if(el)el.innerHTML=this._chart();}
    _refreshLive(){
      this._preview();const ids=this._ids();
      const values={outdoor:this._fmt(this._num(ids.outdoor)),target:this._fmt(this._num(ids.target)),actual:this._fmt(this._num(ids.actual)),points:this._points().length};
      for(const [key,value] of Object.entries(values)){const el=this.shadowRoot.querySelector('[data-live="'+key+'"]');if(el)el.textContent=String(value);}
      const message=this.shadowRoot.querySelector('#message');if(message)message.textContent=this._message||(this._loadingCurve?this._t("Kurve {name} wird geladen …",{name:this._loadingCurve}):'');
    }
    _patchPoints(rows,ready,count,dirty){
      const root=this.shadowRoot,table=root.querySelector('.table-wrap'),body=table?.querySelector('tbody');
      if(!body)return false;
      const top=table.scrollTop,left=table.scrollLeft;
      // The surrounding ha-card, editor buttons and scroll container stay connected.
      // Replacing the entire card here can reset the dashboard's outer scroll area.
      body.innerHTML=rows;table.scrollTop=top;table.scrollLeft=left;
      root.querySelector('#add-point').disabled=!ready||count>=16;
      root.querySelector('#save-points').disabled=!ready;
      const label=root.querySelector('#curve-label');if(label)label.textContent=this._t('Punkttabelle')+(dirty?this._t(' · Entwurf'):'');
      for(const key of Object.keys(FIELDS)){
        const input=root.querySelector('[data-setting="'+key+'"]'),value=this._fieldValue(key);
        if(input)input.value=Number.isFinite(value)?String(value):'';
      }
      this._bindPointRows();return true;
    }
    _render(force=false){
      if(!this._config||!this._hass)return;
      // Keep the real <select> and inputs in the DOM while the user interacts with them.
      // In particular, replacing a focused native select dismisses its open menu.
      if(!force&&this._editing()){
        this._pendingRender=true;this._refreshLive();return;
      }
      this._pendingRender=false;
      const ids=this._ids(),selected=this._selected(),select=this._state(ids.select),points=this._points(),canEdit=this._canEdit()&&!this._bindingError,ready=this._ready()&&canEdit,options=this._options();
      const tableState=this._state(ids.useCurve)?.state,missing=Object.entries(ids).filter(([,id])=>!good(this._state(id))).map(([key,id])=>id||ENTITY_FIELDS[key][2]+this._t(' (nicht zugeordnet)')),dirty=!!this._draft;
      const disabled=this._disabledEditors();
      const mode=tableState==='on'?this._t('Punkttabelle wird verwendet'):tableState==='off'?this._t('Hybrid aktiv · gespeicherte Punkttabelle'):this._t('Kurvenart nicht verfügbar');
      // Readings change frequently; keep the actual controls and scroll container
      // when the editor structure/data is unchanged. Scrollbar dragging and touch
      // scrolling must not depend on an input already having keyboard focus.
      const viewState={language:languageCode(this._config,this._hass),ids,selected,options,points,ready,canEdit,busy:this._busy,loading:this._loadingCurve,tableState,dirty,missing,entry:this._entryId,controller:this._controllerId,circuit:this._circuitId,controllers:this._controllers.map(c=>[c.id,c.label,c.circuits.map(h=>[h.id,h.label])]),bindingError:this._bindingError,registryError:this._registryError,pointService:this._pointService(),
        disabled:disabled.map(e=>[e.entity_id,e.disabled_by]),
        settings:Object.keys(FIELDS).map(key=>{const s=this._state(ids[key]),a=s?.attributes||{};return [key,good(s),this._fieldValue(key),a.min,a.max,a.step];})};
      const viewKey=JSON.stringify(viewState),shellKey=JSON.stringify({...viewState,points:undefined,dirty:undefined,
        settings:viewState.settings.map(([key,available,value,...bounds])=>[key,available,...bounds])});
      if(!force&&this._viewKey===viewKey){this._refreshLive();return;}
      const previousTable=this.shadowRoot.querySelector('.table-wrap');
      const tableScroll=previousTable?{top:previousTable.scrollTop,left:previousTable.scrollLeft}:null;
      const rows=points.map((p,i)=>`<tr><td>${i+1}</td><td><input data-point="${i}" data-axis="outdoor" type="number" step="any" min="-40" max="40" value="${Number.isFinite(p.outdoor)?p.outdoor:''}" ${!ready?'disabled':''} aria-label="${esc(this._t("Punkt {index} Außentemperatur",{index:i+1}))}"></td><td><input data-point="${i}" data-axis="flow" type="number" step="any" min="10" max="90" value="${Number.isFinite(p.flow)?p.flow:''}" ${!ready?'disabled':''} aria-label="${esc(this._t("Punkt {index} Vorlauf",{index:i+1}))}"></td><td><button type="button" data-remove="${i}" ${!ready||points.length<=1?'disabled':''} aria-label="${esc(this._t("Punkt {index} entfernen",{index:i+1}))}">×</button></td></tr>`).join('');
      if(!force&&this._shellKey===shellKey&&this._patchPoints(rows,ready,points.length,dirty)){
        this._viewKey=viewKey;this._refreshLive();return;
      }
      const metric=(label,value,cls='',key='')=>`<div class="metric ${cls}"><span>${label}</span><b data-live="${key}">${value}</b></div>`;
      this.shadowRoot.innerHTML=`<style>${STYLE}${EXTRA_STYLE}</style><ha-card>${this._targetPanel()}${this._lockPanel()}${disabled.length?`<div class="setup"><b>${esc(this._t("Bearbeitung aktivieren"))}</b><p>${esc(this._t("{count} benötigte KeEnergy-Entitäten sind deaktiviert. Als Administrator kannst du die benötigten Entitäten dieses Heizkreises aktivieren.",{count:disabled.length}))}</p><button type="button" id="enable-editors" class="primary" ${this._busy||!canEdit||!this._hass?.user?.is_admin?'disabled':''}>${esc(this._t("Bearbeitungs-Entitäten aktivieren"))}</button></div>`:''}<div class="layout"><section class="chart-panel"><header><div><small>KEBA KEENERGY</small><h2>${esc(this._config.title||this._t("Heizkurve KeEnergy"))}</h2><p>${esc(mode)}</p></div><span class="badge">${esc(selected||'—')}</span></header><div id="chart">${this._chart()}</div><div class="legend"><span><i class="line"></i><span id="curve-label">${esc(this._t("Punkttabelle"))}${dirty?this._t(' · Entwurf'):''}</span></span><span><i class="dot target"></i>${esc(this._t("Regler-Soll"))}</span><span><i class="dot actual"></i>${esc(this._t("Vorlauf Ist"))}</span>${this._config.flow_min!==null||this._config.flow_max!==null?`<span><i class="line flow-range"></i>${esc(this._t("Vorlauf Min / Max"))}</span>`:''}<span><i class="dot interpolated"></i>${esc(this._t("Zwischenwerte"))}</span></div><p class="notice">${this._config.flow_min!==null||this._config.flow_max!==null?this._t('Darstellung begrenzt: ')+esc(this._config.flow_min!==null?this._fmt(this._config.flow_min):this._t('ohne Minimum'))+this._t(' bis ')+esc(this._config.flow_max!==null?this._fmt(this._config.flow_max):this._t('ohne Maximum'))+this._t('. Die Begrenzung gilt nur für das Diagramm. '):this._t('Gespeicherte Tabelle mit linear berechneten Zwischenwerten. ')}${esc(this._t("Der Regler-Sollwert wird separat aus KeEnergy gelesen."))}</p><div id="message" class="notice" role="status">${esc(this._message||(this._loadingCurve?this._t("Kurve {name} wird geladen …",{name:this._loadingCurve}):''))}</div></section><aside><h3>${esc(this._t("Kurventabelle auswählen"))}</h3><label class="field">${esc(this._t("Kurventabelle für diesen Heizkreis"))}<select id="curve-select" aria-label="${esc(this._t("Kurventabelle für diesen Heizkreis"))}" ${!good(select)||this._busy||!canEdit?'disabled':''}>${selected&&!options.includes(selected)?`<option value="" selected>${esc(this._t("Aktuell: {name}",{name:selected}))}</option>`:''}${options.length?options.map(o=>`<option value="${esc(o)}" ${o===selected?'selected':''}>${esc(o)}</option>`).join(''):`<option>${esc(selected||this._t('Keine Kurven verfügbar'))}</option>`}</select></label><p class="hint">${esc(this._t("Die vom Regler angebotenen Heiztabellen (HC…) stehen hier zur Auswahl. Die Auswahl weist sie dem Heizkreis zu. Eine Tabelle kann von mehreren Heizkreisen desselben Reglers gemeinsam verwendet werden."))}</p><h3>${esc(this._t("Aktuelle Werte"))}</h3><div class="metrics">${metric(this._t('Außentemperatur'),this._fmt(this._num(ids.outdoor)),'','outdoor')}${metric(this._t('Vorlauf Soll'),this._fmt(this._num(ids.target)),'target','target')}${metric(this._t('Vorlauf Ist'),this._fmt(this._num(ids.actual)),'actual','actual')}${metric(this._t('Punkte'),points.length,'','points')}</div><h3>${esc(this._t("Heizgrenzen Tag / Nacht"))}</h3><div class="limit-fields">${Object.keys(FIELDS).map(k=>this._input(k)).join('')}</div><button class="primary" id="save-settings" ${this._busy||!canEdit?'disabled':''}>${esc(this._t("Heizgrenzen speichern"))}</button></aside></div><section class="editor"><div class="editor-head"><div><h3>${esc(this._t("Kurvenpunkte bearbeiten"))}</h3><p>${esc(this._t("1 bis 16 Punkte. Die Vorschau aktualisiert sich beim Eingeben. Erst „Punkte speichern“ überträgt die Tabelle."))}</p></div><div class="buttons"><button type="button" id="reset" ${this._busy||!this._canEdit()?'disabled':''}>${esc(this._t("Entwurf verwerfen"))}</button><button type="button" id="add-point" ${!ready||points.length>=16?'disabled':''}>${esc(this._t("Punkt hinzufügen"))}</button><button type="button" id="save-points" class="primary" ${!ready?'disabled':''}>${esc(this._t("Punkte speichern"))}</button></div></div><div class="table-wrap"><table><thead><tr><th>#</th><th>${esc(this._t("Außen °C"))}</th><th>${esc(this._t("Vorlauf °C"))}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>${missing.length||!this._entryId||!this._pointService()?`<details open><summary>${esc(this._t("Entitäten / Einrichtung prüfen"))}</summary>${missing.length?`<p>${esc(this._t("Diese Entitäten fehlen oder liefern noch keine Werte:"))}</p>`:''}<ul>${missing.map(id=>`<li><code>`+esc(id)+`</code></li>`).join('')}</ul>${!this._entryId?`<p>${esc(this._t("Konfigurationseintrag noch nicht gefunden. Optional config_entry in der Karte angeben."))}</p>`:''}${!this._pointService()?`<p>${esc(this._t("Die Aktion keba_keenergy.set_heating_curve_points ist nicht verfügbar. Die Integration muss das Bearbeiten von Kurvenpunkten unterstützen."))}</p>`:''}<button type="button" id="retry">${esc(this._t("Zuordnung erneut laden"))}</button></details>`:''}<p class="hint">${esc(this._t("KeEnergy Heizkurve · Allgemeine Version 1.0.2"))}</p></section></ha-card>`;
      this._viewKey=viewKey;this._shellKey=shellKey;this._bind();
      const table=this.shadowRoot.querySelector('.table-wrap');if(table&&tableScroll){table.scrollTop=tableScroll.top;table.scrollLeft=tableScroll.left;}
    }
    _notice(message){this._message=message;const el=this.shadowRoot.querySelector('#message');if(el)el.textContent=message;}
    _bindPointRows(){
      const root=this.shadowRoot;
      root.querySelectorAll('[data-point]').forEach(el=>el.addEventListener('input',()=>{
        if(!this._canEdit()||this._busy)return;this._touchEdit();
        if(!this._draft)this._draft={name:this._selected(),points:this._readPoints()};
        this._draft.saved=false;this._draft.points[Number(el.dataset.point)][el.dataset.axis]=numeric(el.value);
        this._notice(this._t('Punkte geändert · noch nicht gespeichert'));this._preview();
      }));
      root.querySelectorAll('[data-remove]').forEach(el=>el.addEventListener('click',()=>{const p=this._points();if(!this._canEdit()||!this._ready()||p.length<=1)return;this._touchEdit();p.splice(Number(el.dataset.remove),1);this._draft={name:this._selected(),points:p};this._render();}));
    }
    _bind(){
      const root=this.shadowRoot,on=(selector,event,fn)=>root.querySelector(selector)?.addEventListener(event,fn);
      this._bindPointRows();
      for(const [selector,kind] of [['#controller-select','controller'],['#circuit-select','circuit']]){
        on(selector,'pointerdown',e=>{if(e.button===0&&!e.target.disabled)this._selectInteracting=true;});
        on(selector,'focus',()=>{this._selectInteracting=true;});
        on(selector,'blur',()=>{this._selectInteracting=false;});
        on(selector,'change',e=>{const value=e.target.value;this._selectInteracting=false;e.target.blur();this._chooseTarget(kind,value);});
      }
      on('#reload-registry','click',()=>{if(this._busy)return;this._discovered=false;this._discover();});
      on('#unlock-editor','click',()=>this._openUnlock());
      on('#lock-editor','click',()=>this._lock());
      on('#cancel-unlock','click',()=>this._lock(this._t('Bearbeitung gesperrt.')));
      on('#confirm-unlock','click',event=>this._submitUnlock(event));
      on('#unlock-form','submit',event=>this._submitUnlock(event));
      on('#edit-password','keydown',event=>{if(event.key==='Enter')return this._submitUnlock(event);if(event.key==='Escape'){event.preventDefault();event.stopPropagation();this._lock(this._t('Bearbeitung gesperrt.'));}});
      root.querySelectorAll('[data-setting]').forEach(el=>el.addEventListener('input',()=>{
        if(!this._canEdit()||this._busy)return;this._touchEdit();
        this._edits[el.dataset.setting]=numeric(el.value);
        this._notice(this._t('Parameter geändert · noch nicht gespeichert'));this._preview();
      }));
      on('#curve-select','pointerdown',e=>{if(e.button===0&&!e.target.disabled)this._selectInteracting=true;});
      on('#curve-select','focus',()=>{this._selectInteracting=true;});
      on('#curve-select','blur',()=>{this._selectInteracting=false;});
      on('#curve-select','change',e=>{const value=e.target.value;this._selectInteracting=false;e.target.blur();return this._select(value);});
      on('#reset','click',()=>{if(!this._canEdit()||this._busy)return;this._touchEdit();this._draft=null;this._edits={};this._message=this._t('Entwurf verworfen.');this._render();});
      on('#retry','click',()=>{this._discovered=false;this._registryError=null;this._discover();});
      on('#enable-editors','click',()=>this._enableEditors());
      on('#add-point','click',()=>{
        const p=this._points();if(!this._canEdit()||!this._ready()||p.length>=16)return;this._touchEdit();
        let outdoor=0;while(p.some(v=>v.outdoor===outdoor)&&outdoor<=40)outdoor+=5;
        if(outdoor>40){outdoor=-5;while(p.some(v=>v.outdoor===outdoor)&&outdoor>=-40)outdoor-=5;}
        if(outdoor < -40)outdoor=1;p.push({outdoor,flow:30});this._draft={name:this._selected(),points:p};this._message=this._t('Punkt hinzugefügt · noch nicht gespeichert');this._render();
      });
      on('#save-points','click',()=>this._savePoints());on('#save-settings','click',()=>this._saveSettings());
    }
    async _select(name){
      if(this._busy||!this._requireEdit())return;this._touchEdit();
      if(this._draft||Object.keys(this._edits).length){this._notice(this._t('Vor dem Tabellenwechsel Punkte / Parameter speichern oder den Entwurf verwerfen.'));this._render();return;}
      if(!this._options().includes(name))return;
      this._loadingCurve=name;this._busy=true;this._message=this._t('Kurve wird zugewiesen …');this._render();
      try{await this._hass.callService('select','select_option',{entity_id:this._ids().select,option:name});this._message=this._t("Kurve {name} zugewiesen. Messwerte werden aktualisiert.",{name});}
      catch(error){this._loadingCurve=null;this._message=this._t('Auswahl fehlgeschlagen: ')+(error.message||error);}
      finally{this._busy=false;const ids=this._ids();if(this._state(ids.curve)?.state===name&&this._selected()===name)this._loadingCurve=null;this._render();}
    }
    async _savePoints(){
      if(!this._requireEdit()||!this._ready())return;this._touchEdit();
      if(!this._entryId){this._discovered=false;await this._discover();if(!this._entryId){this._notice(this._t('Integrationseintrag nicht ermittelbar. config_entry in der Kartenkonfiguration angeben.'));return;}}
      if(!this._requireEdit())return;
      const name=this._selected(),points=this._points().map(p=>({outdoor:Math.round(p.outdoor*100)/100,flow:Math.round(p.flow*100)/100})).sort((a,b)=>a.outdoor-b.outdoor);
      if(points.length<1||points.length>16||points.some((p,i)=>!Number.isFinite(p.outdoor)||!Number.isFinite(p.flow)||p.outdoor < -40||p.outdoor>40||p.flow<10||p.flow>90||(i>0&&p.outdoor<=points[i-1].outdoor))){this._notice(this._t('Ungültige Punkte: Außen −40 bis 40 °C, Vorlauf 10 bis 90 °C; Außentemperaturen müssen eindeutig sein.'));return;}
      const live=this._readPoints().sort((a,b)=>a.outdoor-b.outdoor);
      if(JSON.stringify(points)===JSON.stringify(live)){this._draft=null;this._message=this._t('Keine Änderungen an den Punkten.');this._render();return;}
      this._busy=true;this._message=this._t('Punkte werden gespeichert …');this._render();
      try{
        await this._hass.callService('keba_keenergy','set_heating_curve_points',{config_entry:this._entryId,heating_curve:name,points});
        this._draft=this._canEdit()?{name,points,saved:true}:null;this._message=this._t("Punkte für {name} übertragen. Reglerwerte werden aktualisiert.",{name});
        if(JSON.stringify(points)===JSON.stringify(this._readPoints().sort((a,b)=>a.outdoor-b.outdoor)))this._draft=null;
      }catch(error){this._message=this._t('Speichern fehlgeschlagen: ')+(error.message||error);}
      finally{this._busy=false;this._render();}
    }
    async _saveSettings(){
      if(this._busy||!this._requireEdit())return;this._touchEdit();const ids=this._ids(),changes=Object.entries(this._edits);
      for(const [key,value] of changes){
        const s=this._state(ids[key]),{min,max,step}=this._numberMeta(ids[key]),steps=(value-(Number.isFinite(min)?min:0))/step;
        if(!good(s)||!Number.isFinite(value)||(Number.isFinite(min)&&value<min-1e-6)||(Number.isFinite(max)&&value>max+1e-6)||(Number.isFinite(step)&&step>0&&Math.abs(steps-Math.round(steps))>1e-6)){this._notice(this._t("Ungültiger Wert für {field}. Zulässigen Bereich und Schrittweite der Entität beachten.",{field:this._t(FIELDS[key][1])}));return;}
      }
      if(!changes.length){this._notice(this._t('Keine Parameter geändert.'));return;}
      this._busy=true;this._message=this._t('Parameter werden gespeichert …');this._render();let saved=0;
      try{for(const [key,value] of changes){if(!this._canEdit())throw Error(this._t('Bearbeitung gesperrt. Erneut entsperren.'));if(Math.abs(this._num(ids[key])-value)>1e-6){await this._hass.callService('number','set_value',{entity_id:ids[key],value:Math.round(this._fromCelsius(ids[key],value)*1e8)/1e8});saved++;}delete this._edits[key];}this._message=this._t("{count} Parameter übertragen. Der nächste Abgleich zeigt die Reglerwerte.",{count:saved});}
      catch(error){this._message=this._t("Teilweise gespeichert ({count}). Weitere Änderungen nicht übertragen: {error}",{count:saved,error:error.message||error});}
      finally{this._busy=false;this._render();}
    }
  }
const STYLE=':host{display:block;container-type:inline-size;font-family:var(--primary-font-family,Arial,sans-serif);color:var(--primary-text-color,#203b44);--muted:var(--secondary-text-color,#7a8c96);--panel:var(--card-background-color,#fff);--border:var(--divider-color,#e1e9ec)}*{box-sizing:border-box}ha-card{overflow:hidden;border-radius:20px}.layout{display:grid;grid-template-columns:minmax(0,2.1fr) minmax(270px,1fr);gap:16px;padding:16px;background:var(--secondary-background-color,#eef3f4)}.chart-panel,.editor{min-width:0;background:var(--panel);border:1px solid var(--border);border-radius:17px;padding:16px}header,.editor-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 8px 14px}header small{font-size:10px;font-weight:800;letter-spacing:.14em;color:#138e90}h2{margin:6px 0;font-size:25px}header p,.editor-head p{margin:0;font-size:12px;color:var(--muted)}.badge{padding:7px 12px;border-radius:9px;background:#e4f2f0;color:#087f82;font-size:11px;font-weight:750}svg{display:block;width:100%;height:auto}.plot{fill:var(--panel);stroke:var(--border)}.grid{stroke:var(--border);stroke-width:.7;opacity:.65}.curve{fill:none;stroke:#138e90;stroke-width:3;stroke-linejoin:round;stroke-linecap:round}.axes{fill:var(--muted);font-size:10px}.axis-title{font-size:11px;font-weight:600}.point{fill:#138e90;stroke:var(--panel);stroke-width:2}.point-label{fill:#087f82;font-size:10px;font-weight:bold;paint-order:stroke;stroke:var(--panel);stroke-width:3px}.limit{stroke-width:1.4;stroke-dasharray:5 4;opacity:.85}.limit.day{stroke:#72934b}.limit.night{stroke:#7885b0}.limit-label{fill:var(--muted);font-size:9px;font-weight:bold;paint-order:stroke;stroke:var(--panel);stroke-width:3px}.target{fill:var(--panel);stroke:#3b82f6;stroke-width:2.5}.actual{fill:#e99a4a;stroke:var(--panel);stroke-width:1.5}.legend{display:flex;flex-wrap:wrap;justify-content:center;gap:15px;padding:12px 4px 0;font-size:11px;color:var(--muted)}.legend span{display:flex;align-items:center;gap:5px}.line{width:16px;height:3px;border-radius:3px;background:#138e90}.line.pale{background:#92a5b5}.dot{width:8px;height:8px;border-radius:50%}.dot.target{border:2px solid #3b82f6}.dot.actual{background:#e99a4a}aside{min-width:0}h3{margin:5px 2px 10px;font-size:12px;color:var(--muted);letter-spacing:.03em}.field{display:grid;gap:5px;font-size:11px;color:var(--muted)}select,input{min-width:0;width:100%;padding:9px 10px;border:1px solid var(--border);border-radius:9px;background:var(--panel);color:var(--primary-text-color,#203b44);font:inherit}.curve-status{min-height:20px;margin:5px 2px 12px;font-size:10px;color:var(--muted)}.metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:14px}.metric{display:grid;gap:8px;min-height:75px;padding:12px;border:1px solid var(--border);border-radius:13px;background:var(--panel)}.metric span{font-size:10px;color:var(--muted)}.metric b{font-size:21px;white-space:nowrap;font-variant-numeric:tabular-nums}.metric.target{background:#eaf6f2;color:#087f82}.metric.actual{background:#fff6eb;color:#ac6b24}.limit-fields{display:grid;grid-template-columns:1fr 1fr;gap:9px}.limit-fields label{display:grid;gap:5px;font-size:11px;color:var(--muted)}button{border:1px solid var(--border);border-radius:9px;padding:9px 12px;background:var(--panel);color:var(--primary-text-color,#203b44);font:inherit;font-size:11px;font-weight:700;cursor:pointer}button:hover:not(:disabled){border-color:#138e90;color:#087f82}button:disabled{opacity:.45;cursor:not-allowed}.primary{background:#138e90;border-color:#138e90;color:#fff}.primary:hover:not(:disabled){background:#087f82;color:#fff}#save-limits{width:100%;margin-top:9px}.notice{margin:12px 2px 0;padding:10px 12px;border-radius:10px;background:var(--secondary-background-color,#eef3f4);color:var(--muted);font-size:11px;line-height:1.5;overflow-wrap:anywhere}.editor{margin:0 16px 16px}.editor-head{padding:0 0 12px}.editor-head h3{margin:0 0 5px;color:var(--primary-text-color,#203b44)}.buttons{display:flex;gap:8px;flex-wrap:wrap}.table-wrap{max-height:390px;overflow:auto}table{width:100%;border-collapse:collapse;font-size:11px}th,td{padding:7px 8px;text-align:left;border-bottom:1px solid var(--border)}th{position:sticky;top:0;background:var(--panel);color:var(--muted);font-weight:600}td input{padding:7px}.remove{padding:5px 9px;font-size:17px;color:#a54b4b}@container(max-width:760px){.layout{grid-template-columns:1fr}}@container(max-width:440px){.layout{padding:8px;gap:10px}.chart-panel,.editor{padding:12px}.editor{margin:0 8px 8px}.editor-head{align-items:flex-start;flex-direction:column}.metric{padding:9px}.metric b{font-size:18px}.buttons{width:100%}.buttons button{flex:1}}';

  const EXTRA_STYLE=`
    .target-panel{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) auto;align-items:end;gap:12px;margin:16px}.target-error{grid-column:1/-1;margin:0;font-size:12px;color:var(--error-color,#b64c4c)}.target-panel .hint{grid-column:1/-1;margin:0}
    @container(max-width:600px){.target-panel{grid-template-columns:1fr}.target-panel button{justify-self:start}}

    :host{pointer-events:auto}input,select,button{pointer-events:auto}
    .edit-lock{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin:16px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--panel)}
    .edit-lock-info{display:flex;align-items:center;gap:10px;min-width:0}.edit-lock-info ha-icon{color:#138e90;--mdc-icon-size:21px;flex-shrink:0}.edit-lock-info b{display:block;font-size:12px;font-weight:600}.edit-lock-info span{display:block;margin-top:4px;color:var(--muted);font-size:10.5px;line-height:1.5}
    .unlock-form{display:grid;grid-template-columns:minmax(160px,1fr) auto;align-items:end;gap:10px;width:100%;padding-top:10px;border-top:1px solid var(--border)}.unlock-error{grid-column:1/-1;color:var(--error-color,#b64c4c);font-size:11px;min-height:1em}
    @container(max-width:440px){.edit-lock{margin:8px}.unlock-form{grid-template-columns:1fr}.unlock-form .buttons{width:100%}}
    .setup{margin:16px;padding:14px;border:1px solid #138e90;border-radius:12px;background:var(--secondary-background-color,#eef3f4);font-size:12px}.setup p{line-height:1.5}
    .hint{font-size:10.5px;color:var(--muted);line-height:1.5}details{padding:12px;font-size:11px;line-height:1.6}details code{overflow-wrap:anywhere}
    #save-settings{width:100%;margin:9px 0}.chart-panel h2{font-size:22px;font-weight:600;letter-spacing:-.02em}
    .plot{stroke-width:.7}.grid{stroke-width:.5;opacity:.3}.axes{font-size:8.5px;font-weight:400}
    .curve{stroke:var(--curve-line,#278F89);stroke-width:1.7}
    .point{fill:var(--curve-line,#278F89);stroke-width:1.1}
    .point-label{fill:var(--curve-point-label,#9A6138);font-size:10.5px;font-weight:600;stroke:var(--panel);stroke-width:2.5px;stroke-linejoin:round;paint-order:stroke}
    .sample-point{fill:var(--curve-line,#278F89);opacity:.6}
    .sample-label{fill:var(--curve-sample-label,#657B89);font-size:8px;font-weight:450;stroke:var(--panel);stroke-width:2px;stroke-linejoin:round;paint-order:stroke}
    .limit.day,.limit.night{stroke-width:.9;opacity:.55;stroke-dasharray:4 5}.limit-label{font-size:8px;font-weight:500;stroke-width:2px}
    .limit.flow-min{stroke:#4D8DC6;stroke-width:1;stroke-dasharray:6 5;opacity:.75}.limit.flow-max{stroke:#CE7373;stroke-width:1;stroke-dasharray:6 5;opacity:.75}
    .flow-limit-label{font-size:8.5px;font-weight:500;paint-order:stroke;stroke:var(--panel);stroke-width:2px}.flow-limit-label.flow-min{fill:#4D8DC6}.flow-limit-label.flow-max{fill:#CE7373}
    .target{stroke-width:1.5}.actual{stroke-width:1}.legend{font-size:10px;gap:12px}.legend .line{height:2px}.dot.interpolated{width:5px;height:5px;background:#8CA1A4}
    .line.flow-range{background:linear-gradient(to right,#4D8DC6 50%,#CE7373 50%)}.metric b{font-size:19px}.notice{font-size:10.5px;padding:8px 10px;border-radius:8px}
  `;
  if(!customElements.get('keba-keenergy-heizkurve-card'))customElements.define('keba-keenergy-heizkurve-card',KeEnergyHeatingCurveCard);
  window.customCards=window.customCards||[];
  if(!window.customCards.some(c=>c.type==='keba-keenergy-heizkurve-card'))window.customCards.push({type:'keba-keenergy-heizkurve-card',name:'KEBA KeEnergy Heating Curve',description:'Heating curves and limits with automatic discovery · Deutsch / English',preview:false});
})();
