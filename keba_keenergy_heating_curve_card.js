(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/i18n.js
  var DE = {
    "KeEnergy heating curve": "Heizkurve KeEnergy",
    "Heating circuit": "Heizkreis",
    "Controller": "Regler",
    "Controller and heating circuit": "Regler und Heizkreis",
    "Selected controller is missing": "Gew\xE4hlter Regler fehlt",
    "No controller found": "Kein Regler gefunden",
    "Selected heating circuit is missing": "Gew\xE4hlter Heizkreis fehlt",
    "No heating circuit found": "Kein Heizkreis gefunden",
    "Rediscover": "Neu erkennen",
    "Registry: ": "Verzeichnis: ",
    "Password protection": "Kennwortschutz",
    "Password": "Kennwort",
    "Editing unlocked": "Einstellungen freigegeben",
    "Editing locked": "Einstellungen gesperrt",
    "Locks automatically after {minutes} minutes without editing.": "Automatische Sperre nach {minutes} Minuten ohne Bearbeitung.",
    "Unlock to change the curve table, points and heating limits.": "Zum \xC4ndern von Kurventabelle, Punkten und Heizgrenzen entsperren.",
    "Lock": "Sperren",
    "Unlock": "Entsperren",
    "Verifying \u2026": "Wird gepr\xFCft \u2026",
    "Unlock editing": "Bearbeitung freigeben",
    "Cancel": "Abbrechen",
    "Editing locked.": "Bearbeitung gesperrt.",
    "Editing is locked. Please enter the password to unlock.": "Einstellungen gesperrt. Bitte mit Kennwort entsperren.",
    "Locked automatically after inactivity. Unsaved changes discarded.": "Nach Inaktivit\xE4t automatisch gesperrt. Ungespeicherte \xC4nderungen verworfen.",
    "Editing locked. Unsaved changes discarded.": "Bearbeitung gesperrt. Ungespeicherte \xC4nderungen verworfen.",
    "Please enter the password.": "Bitte Kennwort eingeben.",
    "Incorrect password.": "Kennwort ist nicht korrekt.",
    "Editing unlocked.": "Bearbeitung freigegeben.",
    "Password verification failed. Please try again.": "Kennwortpr\xFCfung fehlgeschlagen. Bitte erneut versuchen.",
    "entities must be a mapping.": "entities muss eine Zuordnung sein.",
    "circuit must be a heating circuit number starting at 1.": "circuit muss eine Heizkreisnummer ab 1 sein.",
    "Invalid entity mapping: ": "Ung\xFCltige Entit\xE4tszuordnung: ",
    "edit_password_hash must be a valid PBKDF2-SHA256 verifier. Create one in the visual editor.": "edit_password_hash muss ein g\xFCltiger PBKDF2-SHA256-Pr\xFCfwert sein. Im visuellen Editor kann er erstellt werden.",
    "auto_lock_minutes must be between 1 and 60 minutes.": "auto_lock_minutes muss zwischen 1 und 60 Minuten liegen.",
    "{key} must be between 10 and 90 \xB0C or empty.": "{key} muss zwischen 10 und 90 \xB0C liegen oder leer sein.",
    "flow_min must be less than flow_max.": "flow_min muss kleiner als flow_max sein.",
    "{key} must be between {min} and {max} \xB0C and have at most two decimal places.": "{key} muss zwischen {min} und {max} \xB0C liegen und darf h\xF6chstens zwei Nachkommastellen haben.",
    "{minKey} must be less than {maxKey}.": "{minKey} muss kleiner als {maxKey} sein.",
    "language must be auto, de or en.": "language muss auto, de oder en sein.",
    "Control entities belong to different controllers. Check the card mapping.": "Die Steuerungs-Entit\xE4ten stammen aus verschiedenen Reglern. Zuordnung in der Karte pr\xFCfen.",
    "The configured KeEnergy controller was not found. Check the card configuration.": "Der konfigurierte KeEnergy-Regler wurde nicht gefunden. Kartenkonfiguration pr\xFCfen.",
    "Cannot read the KeEnergy mapping. Open as an administrator or set entities and config_entry manually.": "KeEnergy-Zuordnung nicht lesbar. Als Administrator \xF6ffnen oder Entit\xE4ten und config_entry manuell zuordnen.",
    "No KeEnergy heating circuit with a heating curve table found.": "Kein KeEnergy-Heizkreis mit Heizkurventabelle gefunden.",
    "config_entry and the entity mapping belong to different controllers.": "config_entry und Entit\xE4tszuordnung geh\xF6ren zu verschiedenen Reglern.",
    "Control entities belong to different heating circuits.": "Die Steuerungs-Entit\xE4ten geh\xF6ren zu verschiedenen Heizkreisen.",
    "circuit and the entity mapping belong to different heating circuits.": "circuit und Entit\xE4tszuordnung geh\xF6ren zu verschiedenen Heizkreisen.",
    "The selected heating circuit was not found on this controller.": "Der gew\xE4hlte Heizkreis wurde an diesem Regler nicht gefunden.",
    "Ambiguous entities: {keys}. Please set entities explicitly.": "Mehrdeutige Entit\xE4ten: {keys}. Bitte entities ausdr\xFCcklich zuordnen.",
    "Control entities must come from keba_keenergy.": "Steuerungs-Entit\xE4ten m\xFCssen aus keba_keenergy stammen.",
    "Save changes or discard the draft before switching controller or heating circuit.": "Vor dem Regler- oder Heizkreiswechsel \xC4nderungen speichern oder den Entwurf verwerfen.",
    "View changed. No values were sent.": "Ansicht gewechselt. Es wurden keine Werte \xFCbertragen.",
    "View changed. Please unlock editing again.": "Ansicht gewechselt. Bearbeitung bitte erneut entsperren.",
    "Sign in as an administrator to enable disabled entities.": "Zum Aktivieren deaktivierter Entit\xE4ten als Administrator anmelden.",
    "Entities reloaded. Missing values must be supported by the controller.": "Entit\xE4ten neu eingelesen. Nicht vorhandene Werte m\xFCssen vom Regler unterst\xFCtzt werden.",
    "Enabling required entities \u2026": "Bearbeitungs-Entit\xE4ten werden aktiviert \u2026",
    "Editing locked. Please unlock again.": "Bearbeitung gesperrt. Erneut entsperren.",
    "{count} entities enabled. Home Assistant is loading their values; they will appear after the next update.": "{count} Entit\xE4ten aktiviert. Home Assistant l\xE4dt die Werte; sie erscheinen nach dem n\xE4chsten Update.",
    "Enabling stopped after {count} entities: {error}. Sign in as an administrator or enable entities in the KeEnergy settings.": "Aktivierung nach {count} Entit\xE4ten gestoppt: {error}. Als Administrator anmelden oder Entit\xE4ten in den KeEnergy-Einstellungen aktivieren.",
    "Day heating limit": "Heizgrenze Tag",
    "Night heating limit": "Heizgrenze Nacht",
    "Day": "Tag",
    "Night": "Nacht",
    "HL": "HG",
    "Min": "Min",
    "Max": "Max",
    "Outdoor temperature": "Au\xDFentemperatur",
    "Flow": "Vorlauf",
    "P{index}: outdoor {outdoor} \xB0C \xB7 table {flow} \xB0C \xB7 limited display {shown} \xB0C": "P{index}: Au\xDFen {outdoor} \xB0C \xB7 Tabelle {flow} \xB0C \xB7 begrenzte Anzeige {shown} \xB0C",
    "Interpolated value at {outdoor} \xB0C outdoors: {flow} \xB0C flow": "Zwischenwert bei {outdoor} \xB0C au\xDFen: {flow} \xB0C Vorlauf",
    "Saved heating curve points, interpolated values and current flow temperatures": "Gespeicherte Heizkurvenpunkte, berechnete Zwischenwerte und aktuelle Vorlauftemperaturen",
    "Point {index} outdoor temperature": "Punkt {index} Au\xDFentemperatur",
    "Point {index} flow temperature": "Punkt {index} Vorlauf",
    "Remove point {index}": "Punkt {index} entfernen",
    "Point table": "Punkttabelle",
    " \xB7 Draft": " \xB7 Entwurf",
    "Loading curve {name} \u2026": "Kurve {name} wird geladen \u2026",
    " (not mapped)": " (nicht zugeordnet)",
    "Point table is in use": "Punkttabelle wird verwendet",
    "Hybrid active \xB7 saved point table": "Hybrid aktiv \xB7 gespeicherte Punkttabelle",
    "Curve mode unavailable": "Kurvenart nicht verf\xFCgbar",
    "Enable editing": "Bearbeitung aktivieren",
    "{count} required KeEnergy entities are disabled. An administrator can enable the required entities for this heating circuit.": "{count} ben\xF6tigte KeEnergy-Entit\xE4ten sind deaktiviert. Als Administrator kannst du die ben\xF6tigten Entit\xE4ten dieses Heizkreises aktivieren.",
    "Enable required entities": "Bearbeitungs-Entit\xE4ten aktivieren",
    "Controller target": "Regler-Soll",
    "Actual flow": "Vorlauf Ist",
    "Flow min / max": "Vorlauf Min / Max",
    "Interpolated values": "Zwischenwerte",
    "Display limits: ": "Darstellung begrenzt: ",
    "no minimum": "ohne Minimum",
    "no maximum": "ohne Maximum",
    " to ": " bis ",
    ". Limits apply to the chart only. ": ". Die Begrenzung gilt nur f\xFCr das Diagramm. ",
    "Saved table with linearly interpolated values. ": "Gespeicherte Tabelle mit linear berechneten Zwischenwerten. ",
    "The controller target is read separately from KeEnergy.": "Der Regler-Sollwert wird separat aus KeEnergy gelesen.",
    "Select curve table": "Kurventabelle ausw\xE4hlen",
    "Curve table for this heating circuit": "Kurventabelle f\xFCr diesen Heizkreis",
    "Current: {name}": "Aktuell: {name}",
    "No curves available": "Keine Kurven verf\xFCgbar",
    "Choose one of the heating tables (HC\u2026) offered by the controller. Selecting a table assigns it to this heating circuit. A table can be shared by several circuits on the same controller.": "Die vom Regler angebotenen Heiztabellen (HC\u2026) stehen hier zur Auswahl. Die Auswahl weist sie dem Heizkreis zu. Eine Tabelle kann von mehreren Heizkreisen desselben Reglers gemeinsam verwendet werden.",
    "Current readings": "Aktuelle Werte",
    "Target flow": "Vorlauf Soll",
    "Points": "Punkte",
    "Day / night heating limits": "Heizgrenzen Tag / Nacht",
    "Save heating limits": "Heizgrenzen speichern",
    "Edit curve points": "Kurvenpunkte bearbeiten",
    "1 to 16 points. The preview updates as you type. The table is sent only when you select \u201CSave points\u201D.": "1 bis 16 Punkte. Die Vorschau aktualisiert sich beim Eingeben. Erst \u201EPunkte speichern\u201C \xFCbertr\xE4gt die Tabelle.",
    "Discard draft": "Entwurf verwerfen",
    "Add point": "Punkt hinzuf\xFCgen",
    "Save points": "Punkte speichern",
    "Outdoor \xB0C": "Au\xDFen \xB0C",
    "Flow \xB0C": "Vorlauf \xB0C",
    "Check entities / setup": "Entit\xE4ten / Einrichtung pr\xFCfen",
    "These entities are missing or do not yet provide values:": "Diese Entit\xE4ten fehlen oder liefern noch keine Werte:",
    "Integration entry not found yet. Optionally set config_entry in the card.": "Konfigurationseintrag noch nicht gefunden. Optional config_entry in der Karte angeben.",
    "The keba_keenergy.set_heating_curve_points action is unavailable. The integration must support editing curve points.": "Die Aktion keba_keenergy.set_heating_curve_points ist nicht verf\xFCgbar. Die Integration muss das Bearbeiten von Kurvenpunkten unterst\xFCtzen.",
    "Reload mapping": "Zuordnung erneut laden",
    "KeEnergy heating curve \xB7 General version 1.1.0": "KeEnergy Heizkurve \xB7 Allgemeine Version 1.1.0",
    "Points changed \xB7 not saved yet": "Punkte ge\xE4ndert \xB7 noch nicht gespeichert",
    "Settings changed \xB7 not saved yet": "Parameter ge\xE4ndert \xB7 noch nicht gespeichert",
    "Draft discarded.": "Entwurf verworfen.",
    "Point added \xB7 not saved yet": "Punkt hinzugef\xFCgt \xB7 noch nicht gespeichert",
    "Save points / settings or discard the draft before switching tables.": "Vor dem Tabellenwechsel Punkte / Parameter speichern oder den Entwurf verwerfen.",
    "Assigning curve \u2026": "Kurve wird zugewiesen \u2026",
    "Curve {name} assigned. Readings are updating.": "Kurve {name} zugewiesen. Messwerte werden aktualisiert.",
    "Selection failed: ": "Auswahl fehlgeschlagen: ",
    "Cannot determine the integration entry. Set config_entry in the card configuration.": "Integrationseintrag nicht ermittelbar. config_entry in der Kartenkonfiguration angeben.",
    "Invalid points: outdoor \u221240 to 40 \xB0C, flow 10 to 90 \xB0C; outdoor temperatures must be unique.": "Ung\xFCltige Punkte: Au\xDFen \u221240 bis 40 \xB0C, Vorlauf 10 bis 90 \xB0C; Au\xDFentemperaturen m\xFCssen eindeutig sein.",
    "No changes to the points.": "Keine \xC4nderungen an den Punkten.",
    "Saving points \u2026": "Punkte werden gespeichert \u2026",
    "Points for {name} sent. Controller readings are updating.": "Punkte f\xFCr {name} \xFCbertragen. Reglerwerte werden aktualisiert.",
    "Save failed: ": "Speichern fehlgeschlagen: ",
    "Invalid value for {field}. Observe the entity\u2019s range and step size.": "Ung\xFCltiger Wert f\xFCr {field}. Zul\xE4ssigen Bereich und Schrittweite der Entit\xE4t beachten.",
    "No settings changed.": "Keine Parameter ge\xE4ndert.",
    "Saving settings \u2026": "Parameter werden gespeichert \u2026",
    "{count} settings sent. The next update will show the controller values.": "{count} Parameter \xFCbertragen. Der n\xE4chste Abgleich zeigt die Reglerwerte.",
    "Partially saved ({count}). Remaining changes were not sent: {error}": "Teilweise gespeichert ({count}). Weitere \xC4nderungen nicht \xFCbertragen: {error}",
    "Title": "Titel",
    "Pin controller": "Regler fest zuordnen",
    "Pin heating circuit": "Heizkreis fest zuordnen",
    "Automatic \xB7 selectable in the dashboard": "Automatisch \xB7 im Dashboard ausw\xE4hlbar",
    "Without a fixed mapping, select the controller and heating circuit in the card. Switching the view sends no commands.": "Ohne feste Zuordnung werden Regler und Heizkreis direkt in der Karte gew\xE4hlt. Das Umschalten der Ansicht sendet keine Befehle.",
    "Chart axes": "Diagrammachsen",
    "Automatic": "Automatisch",
    "X-axis \xB7 Outdoor temperature": "X-Achse \xB7 Au\xDFentemperatur",
    "Y-axis \xB7 Flow temperature": "Y-Achse \xB7 Vorlauftemperatur",
    "Minimum (\xB0C)": "Minimum (\xB0C)",
    "Maximum (\xB0C)": "Maximum (\xB0C)",
    "Grid interval (\xB0C)": "Rasterweite (\xB0C)",
    "Interpolated value interval on the X-axis (\xB0C)": "Abstand der Zwischenwerte auf der X-Achse (\xB0C)",
    "Empty bounds are set automatically. The default grid interval is 5 \xB0C. These settings only change the visible chart range and grid.": "Leere Grenzen werden automatisch bestimmt. Die Standard-Rasterweite betr\xE4gt 5 \xB0C. Diese Einstellungen \xE4ndern nur den sichtbaren Diagrammausschnitt und das Raster.",
    "Chart flow limits": "Vorlaufbegrenzungen im Diagramm",
    "Leave empty to show the unmodified table. These values limit the display only and are not sent to the controller.": "Leer lassen f\xFCr die unver\xE4nderte Tabelle. Diese Werte begrenzen nur die Darstellung und werden nicht an den Regler \xFCbertragen.",
    "Display minimum (\xB0C)": "Anzeige Minimum (\xB0C)",
    "Display maximum (\xB0C)": "Anzeige Maximum (\xB0C)",
    "\xB7 configured": "\xB7 eingerichtet",
    "\xB7 optional": "\xB7 optional",
    "Set your own password. Only the verifier is stored in the card configuration. Protection applies to this card interface; Home Assistant permissions still apply.": "Jeder richtet sein eigenes Kennwort ein. Nur der Pr\xFCfwert wird in der Kartenkonfiguration gespeichert. Der Schutz gilt f\xFCr diese Kartenoberfl\xE4che; Home-Assistant-Berechtigungen gelten weiterhin.",
    "New password": "Neues Kennwort",
    "Repeat password": "Kennwort wiederholen",
    "Set password": "Kennwort einrichten",
    "Remove password protection": "Kennwortschutz entfernen",
    "Auto-lock after minutes": "Automatisch sperren nach Minuten",
    "Additional options and manual entity mappings are available in the YAML editor.": "Weitere Optionen und manuelle Entit\xE4tszuordnungen sind im YAML-Editor m\xF6glich.",
    "Both passwords must be filled in and match.": "Beide Kennw\xF6rter m\xFCssen ausgef\xFCllt und gleich sein.",
    "The browser cannot generate secure random values.": "Der Browser kann keinen sicheren Zufallswert erzeugen.",
    "Configuration changed. Please set the password again.": "Konfiguration ge\xE4ndert. Kennwort bitte erneut setzen.",
    "Could not set the password: ": "Kennwort konnte nicht eingerichtet werden: ",
    "Automatic selection unavailable: ": "Automatische Auswahl nicht verf\xFCgbar: ",
    "Entity registry unavailable.": "Entit\xE4tenverzeichnis nicht verf\xFCgbar.",
    "Language": "Sprache",
    "Automatic (Home Assistant)": "Automatisch (Home Assistant)",
    "German": "Deutsch",
    "English": "Englisch"
  };
  function languageCode(config, hass) {
    const raw = config?.language && config.language !== "auto" ? config.language : hass?.locale?.language || hass?.language || "en";
    return String(raw).toLowerCase().replaceAll("_", "-").split("-")[0] === "de" ? "de" : "en";
  }
  function translate(language, text, params = {}) {
    const message = language === "de" ? DE[text] ?? text : text;
    return message.replace(/\{(\w+)\}/g, (match, key) => Object.hasOwn(params, key) ? String(params[key]) : match);
  }
  function formatNumber(value, config, hass, options = {}) {
    const preference = hass?.locale?.number_format;
    const formats = { comma_decimal: "en-US", decimal_comma: "de-DE", quote_decimal: "de-CH", space_comma: "fr-FR", none: "en-US" };
    const requested = config?.language && config.language !== "auto" ? config.language : hass?.locale?.language || hass?.language || "en";
    const locale = formats[preference] || (preference === "system" ? globalThis.navigator?.language : requested) || "en";
    try {
      return new Intl.NumberFormat(locale, { maximumFractionDigits: 1, ...options, ...preference === "none" ? { useGrouping: false } : {} }).format(value);
    } catch {
      return new Intl.NumberFormat("en", { maximumFractionDigits: 1, ...options }).format(value);
    }
  }

  // node_modules/@noble/hashes/utils.js
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
  }
  var atitle = (title) => title ? `"${title}" ` : "";
  function anumber(n, title = "") {
    if (typeof n !== "number")
      throw new TypeError(atitle(title) + "expected number, got " + typeof n);
    if (!Number.isSafeInteger(n) || n < 0)
      throw new RangeError(atitle(title) + "expected integer >= 0, got " + n);
    return n;
  }
  function abytes(value, length, title = "") {
    if (isBytes(value) && (length === void 0 || value.length === length))
      return value;
    if (length !== void 0)
      anumber(length, "length");
    const bytes = isBytes(value);
    const ofLen = length !== void 0 ? ` of length ${length}` : "";
    const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
    const message = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
    if (!bytes)
      throw new TypeError(message);
    throw new RangeError(message);
  }
  function ahash(h) {
    if (typeof h !== "function" || typeof h.create !== "function")
      throw new TypeError("expected hash wrapped by utils.createHasher");
    anumber(h.outputLen);
    anumber(h.blockLen);
    if (h.outputLen < 1 || h.blockLen < 1)
      throw new Error("hash blockLen / outputLen must be >= 1");
  }
  var aobject = (value, label) => {
    if (value === null || typeof value !== "object" || Array.isArray(value))
      throw new TypeError((label === "object" ? "" : `"${label}" `) + "expected object, got type=" + typeof value);
  };
  var aopts = (value, label) => {
    aobject(value, label);
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null)
      throw new TypeError(`"${label}" expected plain object`);
    if (Object.hasOwn(value, "__proto__"))
      throw new TypeError(`"${label}.__proto__" is not allowed`);
  };
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("hash was destroyed");
    if (checkFinished && instance.finished)
      throw new Error("digest() was already called");
  }
  function aoutput(out, instance) {
    abytes(out, void 0, "output");
    const min = instance.outputLen;
    if (!(out.length >= min)) {
      throw new RangeError('"output" expected length >= ' + min);
    }
  }
  function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
      arrays[i].fill(0);
    }
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
  }
  function nextTick(onReject) {
    const host = globalThis;
    if (typeof host.scheduler?.yield === "function") {
      const promise = host.scheduler.yield();
      if (onReject)
        promise.catch(onReject);
      return promise;
    }
    return new Promise((resolve) => host.setTimeout(resolve, 0));
  }
  async function asyncLoop(iters, tick, cb, onReject) {
    anumber(iters, "iters");
    anumber(tick, "tick");
    if (typeof cb !== "function")
      throw new TypeError("callback must be a function");
    let ts = Date.now();
    for (let i = 0; i < iters; i++) {
      cb(i);
      const diff = Date.now() - ts;
      if (diff >= 0 && diff < tick)
        continue;
      await nextTick(onReject);
      ts = Date.now();
    }
  }
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new TypeError("string expected");
    const encoded = new TextEncoder().encode(str);
    try {
      return new Uint8Array(encoded);
    } finally {
      clean(encoded);
    }
  }
  function kdfInputToBytes(data, errorTitle = "") {
    if (typeof data === "string")
      return utf8ToBytes(data);
    return abytes(data, void 0, errorTitle);
  }
  function checkOpts(defaults, opts, title = "opts") {
    aopts(defaults, "defaults");
    if (opts !== void 0)
      aopts(opts, title);
    const merged = Object.assign(/* @__PURE__ */ Object.create(null), defaults, opts);
    return merged;
  }
  function createHasher(hashCons, info = {}) {
    if (typeof hashCons !== "function")
      throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
    info = checkOpts({}, info, "info");
    const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
    const tmp = hashCons(void 0);
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.canXOF = tmp.canXOF;
    hashC.create = (opts) => hashCons(opts);
    Object.assign(hashC, info);
    return Object.freeze(hashC);
  }
  var oidNist = (suffix) => ({
    // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
    // Larger suffix values would need base-128 OID encoding and a different length byte.
    oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
  });

  // node_modules/@noble/hashes/hmac.js
  var _HMAC = class {
    constructor(hash, key) {
      __publicField(this, "oHash");
      __publicField(this, "iHash");
      __publicField(this, "blockLen");
      __publicField(this, "outputLen");
      __publicField(this, "canXOF", false);
      __publicField(this, "finished", false);
      __publicField(this, "destroyed", false);
      ahash(hash);
      abytes(key, void 0, "key");
      this.iHash = hash.create();
      if (typeof this.iHash.update !== "function")
        throw new Error("expected Hash instance");
      this.blockLen = this.iHash.blockLen;
      this.outputLen = this.iHash.outputLen;
      const blockLen = this.blockLen;
      const pad = new Uint8Array(blockLen);
      pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
      for (let i = 0; i < pad.length; i++)
        pad[i] ^= 54;
      this.iHash.update(pad);
      this.oHash = hash.create();
      for (let i = 0; i < pad.length; i++)
        pad[i] ^= 54 ^ 92;
      this.oHash.update(pad);
      clean(pad);
    }
    update(buf) {
      aexists(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const buf = out.subarray(0, this.outputLen);
      this.iHash.digestInto(buf);
      this.oHash.update(buf);
      this.oHash.digestInto(buf);
      this.destroy();
    }
    digest() {
      const out = new Uint8Array(this.oHash.outputLen);
      this.digestInto(out);
      return out;
    }
    _cloneInto(to) {
      to || (to = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash, iHash, finished, destroyed, blockLen, outputLen, canXOF } = this;
      to = to;
      to.finished = finished;
      to.destroyed = destroyed;
      to.blockLen = blockLen;
      to.outputLen = outputLen;
      to.canXOF = canXOF;
      to.oHash = oHash._cloneInto(to.oHash);
      to.iHash = iHash._cloneInto(to.iHash);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
    destroy() {
      this.destroyed = true;
      this.oHash.destroy();
      this.iHash.destroy();
    }
  };
  var hmac = /* @__PURE__ */ (() => {
    const hmac_ = ((hash, key, message) => new _HMAC(hash, key).update(message).digest());
    hmac_.create = (hash, key) => new _HMAC(hash, key);
    return hmac_;
  })();

  // node_modules/@noble/hashes/pbkdf2.js
  function pbkdf2Init(hash, _password, _salt, _opts) {
    ahash(hash);
    const opts = checkOpts({ dkLen: 32, asyncTick: 10 }, _opts);
    const { c, dkLen, asyncTick } = opts;
    anumber(c, "c");
    anumber(dkLen, "dkLen");
    anumber(asyncTick, "asyncTick");
    if (c < 1)
      throw new Error('"c" (iterations) must be >= 1');
    if (dkLen < 1)
      throw new Error('"dkLen" must be >= 1');
    if (dkLen > (2 ** 32 - 1) * hash.outputLen)
      throw new Error("derived key too long");
    const p = kdfInputToBytes(_password, "password");
    try {
      const s = kdfInputToBytes(_salt, "salt");
      try {
        const DK = new Uint8Array(dkLen);
        const { iHash, oHash, outputLen } = hmac.create(hash, p);
        const u = new Uint8Array(outputLen);
        const eng = pbkdf2Engine(iHash, oHash, s, u);
        return { c, dkLen, asyncTick, DK, outputLen, eng };
      } finally {
        if (typeof _salt === "string")
          clean(s);
      }
    } finally {
      if (typeof _password === "string")
        clean(p);
    }
  }
  function pbkdf2Engine(iHash, oHash, salt, u) {
    const counter = new Uint8Array(4);
    const view = createView(counter);
    const salted = iHash._cloneInto().update(salt);
    const work = oHash._cloneInto();
    const iClone = iHash._cloneInto;
    const oClone = oHash._cloneInto;
    return {
      u1: (ti, Ti) => {
        view.setInt32(0, ti, false);
        salted._cloneInto(work).update(counter).digestInto(u);
        oHash._cloneInto(work).update(u).digestInto(u);
        Ti.set(u.subarray(0, Ti.length));
      },
      // Whole `F` inner loop for the sync variant: one optimized function owns the hot loop.
      rounds: (c, Ti) => {
        for (let ui = 1; ui < c; ui++) {
          iClone.call(iHash, work).update(u).digestInto(u);
          oClone.call(oHash, work).update(u).digestInto(u);
          for (let i = 0; i < Ti.length; i++)
            Ti[i] ^= u[i];
        }
      },
      output: (DK) => {
        iHash.destroy();
        oHash.destroy();
        salted.destroy();
        work.destroy();
        clean(u);
        return DK;
      }
    };
  }
  async function pbkdf2Async(hash, password, salt, opts) {
    const { c, dkLen, asyncTick, DK, outputLen, eng } = pbkdf2Init(hash, password, salt, opts);
    const abort = () => {
      eng.output(DK);
      clean(DK);
    };
    for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += outputLen) {
      const Ti = DK.subarray(pos, pos + outputLen);
      eng.u1(ti, Ti);
      await asyncLoop(c - 1, asyncTick, () => {
        eng.rounds(2, Ti);
      }, abort);
    }
    return eng.output(DK);
  }

  // node_modules/@noble/hashes/_u64.js
  var fromNumH = (n) => n / 2 ** 32 | 0;
  var fromNumL = (n) => n >>> 0;
  function setU64FromNum(view, byteOffset, n, isLE) {
    const h = fromNumH(n);
    const l = fromNumL(n);
    view.setUint32(byteOffset, isLE ? l : h, isLE);
    view.setUint32(byteOffset + 4, isLE ? h : l, isLE);
  }

  // node_modules/@noble/hashes/_md.js
  function Chi(a, b, c) {
    return a & b ^ ~a & c;
  }
  function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
  }
  var HashMD = class {
    constructor(blockLen, outputLen, padOffset, isLE) {
      __publicField(this, "blockLen");
      __publicField(this, "outputLen");
      __publicField(this, "canXOF", false);
      __publicField(this, "padOffset");
      __publicField(this, "isLE");
      // For partial updates less than block size
      __publicField(this, "buffer");
      __publicField(this, "view");
      __publicField(this, "finished", false);
      __publicField(this, "length", 0);
      __publicField(this, "pos", 0);
      __publicField(this, "destroyed", false);
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView(this.buffer);
    }
    update(data) {
      aexists(this);
      abytes(data);
      const { view, buffer, blockLen } = this;
      const len = data.length;
      let processed = false;
      for (let pos = 0; pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView(data);
          for (; blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          processed = true;
          continue;
        }
        buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
          processed = true;
        }
      }
      this.length += data.length;
      if (processed)
        this.roundClean();
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      buffer.fill(0, pos);
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        buffer.fill(0);
      }
      setU64FromNum(view, blockLen - 8, this.length * 8, isLE);
      this.process(view, 0);
      this.roundClean();
      const oview = out === buffer ? view : createView(out);
      const len = this.outputLen;
      const outLen = len / 4;
      const state = this.get();
      if (len % 4 || outLen > state.length)
        throw new Error("invalid outputLen");
      for (let i = 0; i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneIntoMeta(to) {
      const { buffer, length, finished, destroyed, pos } = this;
      to.destroyed = destroyed;
      to.finished = finished;
      to.length = length;
      to.pos = pos;
      if (pos)
        to.buffer.set(buffer);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
  };
  var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);

  // node_modules/@noble/hashes/sha2.js
  var SHA256_K = /* @__PURE__ */ Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
  var SHA2_32B = class extends HashMD {
    constructor(outputLen, IV) {
      super(64, outputLen, 8, false);
      // We cannot use array here since array allows indexing by variable
      // which means optimizer/compiler cannot use registers.
      // Numeric initializers matter: starting the fields as `undefined` changes
      // V8's field representation and makes sha256 3x slower (measured).
      __publicField(this, "A", 0);
      __publicField(this, "B", 0);
      __publicField(this, "C", 0);
      __publicField(this, "D", 0);
      __publicField(this, "E", 0);
      __publicField(this, "F", 0);
      __publicField(this, "G", 0);
      __publicField(this, "H", 0);
      this.A = IV[0] | 0;
      this.B = IV[1] | 0;
      this.C = IV[2] | 0;
      this.D = IV[3] | 0;
      this.E = IV[4] | 0;
      this.F = IV[5] | 0;
      this.G = IV[6] | 0;
      this.H = IV[7] | 0;
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    // prettier-ignore
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    _cloneInto(to) {
      (to || (to = new this.constructor())).set(...this.get());
      return this._cloneIntoMeta(to);
    }
    process(view, offset) {
      for (let i = 0; i < 16; i++, offset += 4)
        SHA256_W[i] = view.getUint32(offset, false);
      for (let i = 16; i < 64; i++) {
        const W15 = SHA256_W[i - 15];
        const W2 = SHA256_W[i - 2];
        const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
        const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
        SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0; i < 64; i++) {
        const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
        const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
        const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
        const T2 = sigma0 + Maj(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
      clean(SHA256_W);
    }
    destroy() {
      this.destroyed = true;
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      clean(this.buffer);
    }
  };
  var _SHA256 = class extends SHA2_32B {
    constructor() {
      super(32, SHA256_IV);
    }
  };
  var sha256 = /* @__PURE__ */ createHasher(
    () => new _SHA256(),
    /* @__PURE__ */ oidNist(1)
  );

  // src/discovery.js
  var FIELDS = {
    select: ["select", "heating_curve", "curve_select"],
    curve: ["sensor", "heating_curve", "curve_sensor"],
    outdoor: ["sensor", "outdoor_temperature", "outdoor_temperature"],
    actual: ["sensor", "flow_temperature", "flow_temperature"],
    target: ["sensor", "flow_temperature_setpoint", "flow_setpoint"],
    useCurve: ["switch", "use_heating_curve", "use_heating_curve"],
    limitDay: ["number", "heating_limit_day", "heating_limit_day"],
    limitNight: ["number", "heating_limit_night", "heating_limit_night"]
  };
  function parseEntity(entity) {
    if (entity.platform !== "keba_keenergy") return null;
    const domain = entity.entity_id?.split(".")[0];
    const unique = String(entity.unique_id || "").replace(/^keba_keenergy_/, "").replace("_heating_circuit_", "_heat_circuit_").replace("_use_curve_table", "_use_heating_curve").replace("_mixer_flow_temperature", "_flow_temperature");
    const outdoor = unique.match(/^(.+)_outdoor_temperature$/);
    if (outdoor && domain === "sensor") return { serial: outdoor[1], key: "outdoor" };
    const match = unique.match(/^(.+)_heat_circuit_(?:(\d+)_)?(heating_curve|flow_temperature_setpoint|flow_temperature|use_heating_curve|heating_limit_day|heating_limit_night)(?:_(\d+))?$/);
    if (!match || match[2] && match[4]) return null;
    const key = Object.keys(FIELDS).find((k) => k !== "outdoor" && FIELDS[k][0] === domain && FIELDS[k][1] === match[3]);
    return key ? { serial: match[1], circuit: match[2] || match[4] || "1", key } : null;
  }
  function discoverControllers(registry, devices = [], t = (text) => text) {
    var _a, _b;
    const controllers = /* @__PURE__ */ new Map();
    const deviceLabel = (id) => {
      const d = devices.find((device) => device.id === id);
      return d?.name_by_user || d?.name || "";
    };
    for (const entity of registry) {
      const p = parseEntity(entity);
      if (!p || !entity.config_entry_id) continue;
      let controller = controllers.get(entity.config_entry_id);
      if (!controller) {
        controller = { id: entity.config_entry_id, serial: p.serial, label: "", circuits: [], outdoorCandidates: [] };
        controllers.set(controller.id, controller);
      }
      if (p.serial !== controller.serial) continue;
      if (p.key === "outdoor") {
        controller.outdoorCandidates.push(entity);
        controller.label = deviceLabel(entity.device_id) || controller.label;
        continue;
      }
      let circuit = controller.circuits.find((c) => c.id === p.circuit);
      if (!circuit) {
        circuit = { id: p.circuit, label: "", candidates: {}, map: {}, ambiguous: [] };
        controller.circuits.push(circuit);
      }
      circuit.label || (circuit.label = deviceLabel(entity.device_id));
      ((_a = circuit.candidates)[_b = p.key] || (_a[_b] = [])).push(entity);
    }
    return [...controllers.values()].map((controller) => {
      const outdoor = controller.outdoorCandidates;
      controller.outdoor = outdoor.length === 1 ? outdoor[0].entity_id : "";
      controller.label = (controller.label || "KeEnergy") + " \xB7 " + controller.serial;
      controller.circuits = controller.circuits.filter((c) => c.candidates.curve || c.candidates.select).map((circuit) => {
        circuit.label = t("Heating circuit") + " " + circuit.id + (circuit.label ? " \xB7 " + circuit.label : "");
        for (const [key, entries] of Object.entries(circuit.candidates)) {
          if (entries.length === 1) circuit.map[key] = entries[0].entity_id;
          else circuit.ambiguous.push(key);
        }
        if (controller.outdoor) circuit.map.outdoor = controller.outdoor;
        return circuit;
      }).sort((a, b) => a.id.localeCompare(b.id, void 0, { numeric: true }));
      return controller;
    }).filter((c) => c.circuits.length).sort((a, b) => a.serial.localeCompare(b.serial, void 0, { numeric: true }));
  }
  async function loadRegistry(hass, t = (text) => text) {
    const [entities, devices] = await Promise.allSettled([
      hass.callWS({ type: "config/entity_registry/list" }),
      hass.callWS({ type: "config/device_registry/list" })
    ]);
    if (entities.status === "rejected") throw entities.reason;
    if (!Array.isArray(entities.value)) throw Error(t("Entity registry unavailable."));
    return { registry: entities.value, devices: devices.status === "fulfilled" && Array.isArray(devices.value) ? devices.value : [] };
  }

  // src/chart-axis.js
  var DEFAULT_AXIS_STEP = 5;
  var MIN_AXIS_STEP = 0.01;
  var AXIS_LIMITS = {
    x: { min: -100, max: 100 },
    y: { min: 0, max: 150 }
  };
  var INTERMEDIATE_STEP = {
    min: MIN_AXIS_STEP,
    max: AXIS_LIMITS.x.max - AXIS_LIMITS.x.min,
    default: 5
  };
  function axisRange(min, max, autoMin, autoMax) {
    return {
      min: min ?? (max !== null && max <= autoMin ? max - DEFAULT_AXIS_STEP : autoMin),
      max: max ?? (min !== null && min >= autoMax ? min + DEFAULT_AXIS_STEP : autoMax)
    };
  }
  function axisTicks({ min, max }, step, { fixedMin, fixedMax, length, labelGap }) {
    const span = max - min;
    const interval = step * Math.max(1, Math.ceil(span / step / 120));
    const labelClearance = labelGap * span / length;
    const labelEvery = Math.ceil(labelClearance / interval);
    const origin = fixedMin ? min : 0;
    const first = Math.ceil((min - origin) / interval - 1e-9);
    const last = Math.floor((max - origin) / interval + 1e-9);
    const ticks = [];
    for (let index = first; index <= last; index++) {
      const value = Math.round((origin + index * interval) * 100) / 100;
      const showLabel = index % labelEvery === 0 && (!fixedMax || max - value >= labelClearance);
      ticks.push({ value, showLabel });
    }
    if (fixedMax) {
      const lastTick = ticks[ticks.length - 1];
      if (lastTick?.value === max) lastTick.showLabel = true;
      else ticks.push({ value: max, showLabel: true });
    }
    return ticks;
  }

  // src/editor.js
  var esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  var KeEnergyHeatingCurveEditor = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
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
    _t(text, params) {
      return translate(languageCode(this._config, this._hass), text, params);
    }
    async _load() {
      this._loading = true;
      try {
        const { registry, devices } = await loadRegistry(this._hass, (text) => this._t(text));
        this._registry = registry;
        this._devices = devices;
        this._controllers = discoverControllers(registry, devices, (text) => this._t(text));
      } catch (error) {
        this._error = this._t("Automatic selection unavailable: ") + (error.message || error);
      } finally {
        this._loaded = true;
        this._loading = false;
        if (!this.shadowRoot.activeElement) this._render();
      }
    }
    _emit() {
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: { ...this._config } }, bubbles: true, composed: true }));
    }
    _change(key, value, redraw = false) {
      if (value === "" || value == null) delete this._config[key];
      else
        this._config[key] = value;
      this._revision++;
      if (redraw) this._render();
      this._emit();
    }
    async _createPassword() {
      const one = this.shadowRoot.querySelector("#new-password"), two = this.shadowRoot.querySelector("#repeat-password");
      const message = this.shadowRoot.querySelector("#password-message");
      if (!one.value || one.value !== two.value) {
        message.textContent = this._t("Both passwords must be filled in and match.");
        return;
      }
      if (!globalThis.crypto?.getRandomValues) {
        message.textContent = this._t("The browser cannot generate secure random values.");
        return;
      }
      const revision = this._revision, bytes = new TextEncoder().encode(one.value);
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const button = this.shadowRoot.querySelector("#create-password");
      button.disabled = true;
      one.value = "";
      two.value = "";
      let derived;
      try {
        derived = await pbkdf2Async(sha256, bytes, salt, { c: 12e4, dkLen: 32 });
        if (revision !== this._revision) {
          message.textContent = this._t("Configuration changed. Please set the password again.");
          return;
        }
        this._change("edit_password_hash", ["pbkdf2-sha256", 12e4, hex(salt), hex(derived)].join("$"), true);
      } catch (error) {
        message.textContent = this._t("Could not set the password: ") + (error.message || error);
      } finally {
        bytes.fill(0);
        derived?.fill(0);
        button.disabled = false;
      }
    }
    _render() {
      if (!this._config) return;
      const c = this._config;
      if (this._registry) this._controllers = discoverControllers(this._registry, this._devices, (text) => this._t(text));
      const selected = this._controllers.find((controller) => controller.id === c.config_entry || !c.config_entry && String(c.serial || "") === controller.serial);
      const circuits = selected?.circuits || [];
      const field = (label, key, type = "text", extra = "") => {
        const value = type === "number" ? String(c[key] ?? "").replace(",", ".") : c[key];
        return `<label>${esc(label)}<input data-config="${key}" type="${type}" value="${esc(value)}" ${extra}></label>`;
      };
      const axisFields = (axis, title) => {
        const { min, max } = AXIS_LIMITS[axis];
        const bounds = `min="${min}" max="${max}" step="0.01" placeholder="${esc(this._t("Automatic"))}"`;
        return `<fieldset><legend>${esc(title)}</legend><div class="grid axis-fields">
        ${field(this._t("Minimum (\xB0C)"), `${axis}_min`, "number", bounds)}
        ${field(this._t("Maximum (\xB0C)"), `${axis}_max`, "number", bounds)}
        ${field(this._t("Grid interval (\xB0C)"), `${axis}_step`, "number", `min="${MIN_AXIS_STEP}" max="${max - min}" step="0.01" placeholder="${DEFAULT_AXIS_STEP}"`)}
      </div></fieldset>`;
      };
      const axesOpen = this.shadowRoot.querySelector("#chart-axes")?.open;
      this.shadowRoot.innerHTML = `<style>
      :host{display:block;color:var(--primary-text-color);font:14px var(--primary-font-family,Arial)}*{box-sizing:border-box}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}label{display:grid;gap:6px;margin:12px 0;font-size:12px}
      input,select,button{font:inherit;color:var(--primary-text-color);background:var(--card-background-color,#fff);padding:10px;border:1px solid var(--divider-color,#ccc);border-radius:8px;min-width:0}
      button{cursor:pointer;margin:6px 6px 6px 0}p{color:var(--secondary-text-color);font-size:12px;line-height:1.5}summary{cursor:pointer}#password-message{color:var(--error-color,#a44)}
      fieldset{min-width:0;border:1px solid var(--divider-color,#ccc);border-radius:8px;margin:10px 0;padding:0 10px}legend{font-size:12px}.axis-fields{grid-template-columns:repeat(3,minmax(0,1fr))}
      @media(max-width:450px){.grid{grid-template-columns:1fr}}
      </style>${field(this._t("Title"), "title")}
      <label>${esc(this._t("Language"))}<select id="config-language" aria-label="${esc(this._t("Language"))}">${["auto", "de", "en"].map((value) => `<option value="${value}" ${(c.language || "auto") === value ? "selected" : ""}>${esc(this._t(value === "auto" ? "Automatic (Home Assistant)" : value === "de" ? "German" : "English"))}</option>`).join("")}</select></label>
      <label>${esc(this._t("Pin controller"))}<select id="config-controller" aria-label="${esc(this._t("Pin controller"))}"><option value="">${esc(this._t("Automatic \xB7 selectable in the dashboard"))}</option>${this._controllers.map((controller) => `<option value="${esc(controller.id)}" ${selected?.id === controller.id ? "selected" : ""}>${esc(controller.label)}</option>`).join("")}</select></label>
      <label>${esc(this._t("Pin heating circuit"))}<select id="config-circuit" aria-label="${esc(this._t("Pin heating circuit"))}"><option value="">${esc(this._t("Automatic \xB7 selectable in the dashboard"))}</option>${circuits.map((circuit) => `<option value="${esc(circuit.id)}" ${String(c.circuit || "") === circuit.id ? "selected" : ""}>${esc(circuit.label)}</option>`).join("")}${c.circuit && !circuits.some((circuit) => circuit.id === String(c.circuit)) ? `<option value="${esc(c.circuit)}" selected>${esc(this._t("Heating circuit"))} ${esc(c.circuit)}</option>` : ""}</select></label>
      <p>${esc(this._t("Without a fixed mapping, select the controller and heating circuit in the card. Switching the view sends no commands."))}</p>
      ${this._error ? `<p>${esc(this._error)}</p>` : ""}
      <details id="chart-axes" ${axesOpen ? "open" : ""}>
        <summary>${esc(this._t("Chart axes"))}</summary>
        <p>${esc(this._t("Empty bounds are set automatically. The default grid interval is 5 \xB0C. These settings only change the visible chart range and grid."))}</p>
        ${axisFields("x", this._t("X-axis \xB7 Outdoor temperature"))}
        ${axisFields("y", this._t("Y-axis \xB7 Flow temperature"))}
        <fieldset><legend>${esc(this._t("Interpolated values"))}</legend>
          ${field(this._t("Interpolated value interval on the X-axis (\xB0C)"), "intermediate_step", "number", `min="${INTERMEDIATE_STEP.min}" max="${INTERMEDIATE_STEP.max}" step="0.01" placeholder="${INTERMEDIATE_STEP.default}"`)}
        </fieldset>
      </details>
      <details><summary>${esc(this._t("Chart flow limits"))}</summary><p>${esc(this._t("Leave empty to show the unmodified table. These values limit the display only and are not sent to the controller."))}</p><div class="grid">${field(this._t("Display minimum (\xB0C)"), "flow_min", "number", 'min="10" max="90" step="any"')}${field(this._t("Display maximum (\xB0C)"), "flow_max", "number", 'min="10" max="90" step="any"')}</div></details>
      <details><summary>${esc(this._t("Password protection"))} ${c.edit_password_hash ? this._t("\xB7 configured") : this._t("\xB7 optional")}</summary><p>${esc(this._t("Set your own password. Only the verifier is stored in the card configuration. Protection applies to this card interface; Home Assistant permissions still apply."))}</p>
      <div class="grid"><label>${esc(this._t("New password"))}<input id="new-password" type="password" autocomplete="new-password"></label><label>${esc(this._t("Repeat password"))}<input id="repeat-password" type="password" autocomplete="new-password"></label></div>
      <button type="button" id="create-password">${esc(this._t("Set password"))}</button>${c.edit_password_hash ? `<button type="button" id="remove-password">${esc(this._t("Remove password protection"))}</button>` : ""}
      <p id="password-message" role="status"></p>${field(this._t("Auto-lock after minutes"), "auto_lock_minutes", "number", 'min="1" max="60" step="1"')}</details>
      <p>${esc(this._t("Additional options and manual entity mappings are available in the YAML editor."))}</p>`;
      this.shadowRoot.querySelectorAll("[data-config]").forEach((input) => input.addEventListener("change", () => {
        if (input.closest("#chart-axes") && !input.reportValidity()) return;
        const value = input.type === "number" && input.value !== "" ? Number(input.value) : input.value;
        this._change(input.dataset.config, value);
      }));
      this.shadowRoot.querySelector("#config-language").addEventListener("change", (event) => this._change("language", event.target.value, true));
      this.shadowRoot.querySelector("#config-controller").addEventListener("change", (event) => {
        delete this._config.serial;
        delete this._config.circuit;
        this._change("config_entry", event.target.value, true);
      });
      this.shadowRoot.querySelector("#config-circuit").addEventListener("change", (event) => this._change("circuit", event.target.value));
      this.shadowRoot.querySelector("#create-password").addEventListener("click", () => this._createPassword());
      this.shadowRoot.querySelector("#remove-password")?.addEventListener("click", () => this._change("edit_password_hash", "", true));
    }
  };
  if (!customElements.get("keba-keenergy-heating-curve-card-editor")) customElements.define("keba-keenergy-heating-curve-card-editor", KeEnergyHeatingCurveEditor);

  // src/card.js
  (() => {
    "use strict";
    const esc2 = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const numeric = (v) => v == null || String(v).trim() === "" ? NaN : Number(String(v).replace(",", "."));
    const good = (s) => !!s && !["unknown", "unavailable", ""].includes(s.state);
    const FIELDS2 = { limitDay: ["heating_limit_day", "Day heating limit", "\xB0C"], limitNight: ["heating_limit_night", "Night heating limit", "\xB0C"] };
    let cardSequence = 0;
    const interpolate = (outdoor, points) => {
      if (!points.length) return NaN;
      if (points.length === 1) return points[0].flow;
      let i = points.findIndex((p, index) => index < points.length - 1 && outdoor <= points[index + 1].outdoor);
      if (i < 0) i = points.length - 2;
      const a = points[i], b = points[i + 1];
      return a.flow + (outdoor - a.outdoor) / (b.outdoor - a.outdoor) * (b.flow - a.flow);
    };
    class KeEnergyHeatingCurveCard extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._edits = {};
        this._draft = null;
        this._busy = false;
        this._message = "";
        this._map = {};
        this._registry = [];
        this._pendingRender = false;
        this._selectInteracting = false;
        this._unlockedUntil = 0;
        this._lockTimer = null;
        this._lockRevision = 0;
        this._unlockOpen = false;
        this._verifying = false;
        this._unlockError = "";
        this._viewKey = null;
        this._plotId = "keenergy-plot-" + ++cardSequence;
        this._discoveryRevision = 0;
        this._controllers = [];
        this._controllerId = "";
        this._circuitId = "";
        this._visibilityHandler = () => {
          if (this._passwordCheck && globalThis.document?.hidden) this._lock(this._t("Editing locked."));
        };
        const flush = () => queueMicrotask(() => {
          if (this._pendingRender && !this._editing()) this._render();
        });
        this.shadowRoot.addEventListener("focusout", (event) => {
          if (event.relatedTarget && this.shadowRoot.contains(event.relatedTarget) && event.relatedTarget.matches("button")) return;
          flush();
        });
        this.shadowRoot.addEventListener("click", flush);
      }
      setConfig(config) {
        if (config.entities && (typeof config.entities !== "object" || Array.isArray(config.entities))) throw Error(this._t("entities must be a mapping."));
        this._config = { title: "", language: "auto", serial: "", circuit: "", flow_min: null, flow_max: null, edit_password_hash: "", auto_lock_minutes: 5, ...config };
        if (!["auto", "de", "en"].includes(this._config.language)) throw Error(this._t("language must be auto, de or en."));
        for (const key of ["serial", "circuit", "config_entry"]) this._config[key] = String(this._config[key] ?? "").trim();
        if (this._config.circuit && !/^[1-9]\d*$/.test(this._config.circuit)) throw Error(this._t("circuit must be a heating circuit number starting at 1."));
        for (const [key, id] of Object.entries(this._config.entities || {})) {
          const field = Object.values(FIELDS).find((f) => f[2] === key);
          if (!field || typeof id !== "string" || !id.startsWith(field[0] + ".")) throw Error(this._t("Invalid entity mapping: ") + key);
        }
        const token = String(this._config.edit_password_hash || "").match(/^pbkdf2-sha256\$(\d+)\$([0-9a-f]{32})\$([0-9a-f]{64})$/i);
        if (this._config.edit_password_hash && (!token || Number(token[1]) < 1e5 || Number(token[1]) > 1e6)) throw Error(this._t("edit_password_hash must be a valid PBKDF2-SHA256 verifier. Create one in the visual editor."));
        this._passwordCheck = token ? { iterations: Number(token[1]), salt: token[2], hash: token[3].toLowerCase() } : null;
        this._config.auto_lock_minutes = numeric(this._config.auto_lock_minutes);
        if (!Number.isFinite(this._config.auto_lock_minutes) || this._config.auto_lock_minutes < 1 || this._config.auto_lock_minutes > 60) throw Error(this._t("auto_lock_minutes must be between 1 and 60 minutes."));
        clearTimeout(this._lockTimer);
        this._lockTimer = null;
        this._unlockedUntil = 0;
        this._lockRevision++;
        this._unlockOpen = false;
        this._verifying = false;
        this._unlockError = "";
        for (const key of ["flow_min", "flow_max"]) {
          this._config[key] = this._config[key] === null || this._config[key] === "" ? null : numeric(this._config[key]);
          if (this._config[key] !== null && (!Number.isFinite(this._config[key]) || this._config[key] < 10 || this._config[key] > 90)) throw Error(this._t("{key} must be between 10 and 90 \xB0C or empty.", { key }));
        }
        if (this._config.flow_min !== null && this._config.flow_max !== null && this._config.flow_min >= this._config.flow_max) throw Error(this._t("flow_min must be less than flow_max."));
        const setChartOption = (key, min, max) => {
          const raw = this._config[key];
          const value = raw == null || typeof raw === "string" && !raw.trim() ? null : numeric(raw);
          if (value !== null && (!["number", "string"].includes(typeof raw) || value < min || value > max || value !== Math.round(value * 100) / 100)) {
            throw Error(this._t("{key} must be between {min} and {max} \xB0C and have at most two decimal places.", {
              key,
              min: this._number(min, { maximumFractionDigits: 2 }),
              max: this._number(max)
            }));
          }
          this._config[key] = value;
        };
        for (const [axis, { min, max }] of Object.entries(AXIS_LIMITS)) {
          const minKey = axis + "_min";
          const maxKey = axis + "_max";
          setChartOption(minKey, min, max);
          setChartOption(maxKey, min, max);
          setChartOption(axis + "_step", MIN_AXIS_STEP, max - min);
          if (this._config[minKey] !== null && this._config[maxKey] !== null && this._config[minKey] >= this._config[maxKey]) {
            throw Error(this._t("{minKey} must be less than {maxKey}.", { minKey, maxKey }));
          }
        }
        setChartOption("intermediate_step", INTERMEDIATE_STEP.min, INTERMEDIATE_STEP.max);
        this._discoveryRevision++;
        this._controllers = [];
        this._registry = [];
        this._controllerId = "";
        this._circuitId = "";
        this._bindingError = "";
        this._registryError = "";
        this._map = {};
        this._entryId = this._config.config_entry || null;
        this._discovered = false;
        this._discovering = false;
        this._message = "";
        this._draft = null;
        this._edits = {};
        this._loadingCurve = null;
        this._pendingRender = false;
        this._selectInteracting = false;
        this._viewKey = null;
        this._render(true);
        this._discover();
      }
      set hass(hass) {
        const oldLanguage = languageCode(this._config, this._hass);
        this._hass = hass;
        if (oldLanguage !== languageCode(this._config, hass)) {
          this._message = "";
          this._unlockError = "";
          if (this._registry.length) {
            this._controllers = discoverControllers(this._registry, this._devices || [], (text) => this._t(text));
            this._applySelection();
          }
        }
        if (this._loadingCurve && !this._busy) {
          const id = this._ids();
          if (this._state(id.curve)?.state === this._loadingCurve && this._state(id.select)?.state === this._loadingCurve) {
            this._loadingCurve = null;
          }
        }
        if (this._draft?.saved && this._draft.name === this._selected() && JSON.stringify(this._draft.points) === JSON.stringify(this._readPoints().sort((a, b) => a.outdoor - b.outdoor))) {
          this._draft = null;
        }
        this._render();
        this._discover();
      }
      _t(text, params) {
        return translate(languageCode(this._config, this._hass), text, params);
      }
      _number(value, options) {
        return formatNumber(value, this._config, this._hass, options);
      }
      _fmt(value) {
        return Number.isFinite(value) ? this._number(value) + " \xB0C" : "\u2014";
      }
      getCardSize() {
        return 11;
      }
      getGridOptions() {
        return { columns: "full", min_columns: 6 };
      }
      static getStubConfig() {
        return {};
      }
      static getConfigElement() {
        return document.createElement("keba-keenergy-heating-curve-card-editor");
      }
      connectedCallback() {
        globalThis.document?.addEventListener("visibilitychange", this._visibilityHandler);
      }
      disconnectedCallback() {
        globalThis.document?.removeEventListener("visibilitychange", this._visibilityHandler);
        if (this._passwordCheck) this._lock(this._t("Editing locked."));
      }
      _canEdit() {
        return !this._passwordCheck || this._unlockedUntil > Date.now();
      }
      _requireEdit() {
        if (this._bindingError) {
          this._notice(this._bindingError);
          return false;
        }
        if (this._canEdit()) return true;
        this._notice(this._t("Editing is locked. Please enter the password to unlock."));
        return false;
      }
      _touchEdit() {
        if (!this._passwordCheck || !this._canEdit()) return;
        this._unlockedUntil = Date.now() + this._config.auto_lock_minutes * 6e4;
        clearTimeout(this._lockTimer);
        this._lockTimer = setTimeout(() => this._lock(this._t("Locked automatically after inactivity. Unsaved changes discarded.")), this._config.auto_lock_minutes * 6e4);
      }
      _lock(message = this._t("Editing locked. Unsaved changes discarded.")) {
        clearTimeout(this._lockTimer);
        this._lockTimer = null;
        this._unlockedUntil = 0;
        this._lockRevision++;
        this._unlockOpen = false;
        this._verifying = false;
        this._unlockError = "";
        this._draft = null;
        this._edits = {};
        this._selectInteracting = false;
        this._message = message;
        this._render(true);
      }
      _openUnlock() {
        this._unlockOpen = true;
        this._unlockError = "";
        this._render(true);
        queueMicrotask(() => this.shadowRoot.querySelector("#edit-password")?.focus());
      }
      _submitUnlock(event) {
        event?.preventDefault?.();
        event?.stopPropagation?.();
        if (this._verifying) return;
        const input = this.shadowRoot.querySelector("#edit-password"), password = input?.value || "";
        if (!password) {
          this._unlockError = this._t("Please enter the password.");
          this._render(true);
          queueMicrotask(() => this.shadowRoot.querySelector("#edit-password")?.focus());
          return;
        }
        if (input) input.value = "";
        return this._unlock(password);
      }
      async _unlock(password) {
        if (this._verifying || !this._passwordCheck) return false;
        const revision = this._lockRevision, check = this._passwordCheck;
        const bytes = new TextEncoder().encode(String(password));
        this._verifying = true;
        this._unlockError = "";
        this._render(true);
        let derived;
        try {
          const salt = Uint8Array.from(check.salt.match(/../g), (v) => parseInt(v, 16));
          derived = await pbkdf2Async(sha256, bytes, salt, { c: check.iterations, dkLen: 32 });
          if (revision !== this._lockRevision) return false;
          const expected = Uint8Array.from(check.hash.match(/../g), (v) => parseInt(v, 16));
          let difference = 0;
          for (let i = 0; i < expected.length; i++) difference |= derived[i] ^ expected[i];
          if (difference) {
            this._unlockError = this._t("Incorrect password.");
            return false;
          }
          this._unlockedUntil = Date.now() + this._config.auto_lock_minutes * 6e4;
          this._unlockOpen = false;
          this._message = this._t("Editing unlocked.");
          this._touchEdit();
          return true;
        } catch {
          if (revision === this._lockRevision) this._unlockError = this._t("Password verification failed. Please try again.");
          return false;
        } finally {
          bytes.fill(0);
          derived?.fill(0);
          if (revision === this._lockRevision) {
            this._verifying = false;
            this._render(true);
            if (this._unlockOpen) queueMicrotask(() => this.shadowRoot.querySelector("#edit-password")?.focus());
          }
        }
      }
      _lockPanel() {
        if (!this._passwordCheck) return "";
        const unlocked = this._canEdit();
        return `<section class="edit-lock" aria-label="${esc2(this._t("Password protection"))}"><div class="edit-lock-info"><ha-icon icon="mdi:${unlocked ? "lock-open-outline" : "lock-outline"}" aria-hidden="true"></ha-icon><div><b>${unlocked ? this._t("Editing unlocked") : this._t("Editing locked")}</b><span>${unlocked ? this._t("Locks automatically after {minutes} minutes without editing.", { minutes: this._config.auto_lock_minutes }) : this._t("Unlock to change the curve table, points and heating limits.")}</span></div></div><button type="button" id="${unlocked ? "lock-editor" : "unlock-editor"}">${unlocked ? this._t("Lock") : this._t("Unlock")}</button>${this._unlockOpen && !unlocked ? `<form id="unlock-form" class="unlock-form"><label class="field">${esc2(this._t("Password"))}<input id="edit-password" type="password" autocomplete="current-password" required ${this._verifying ? "disabled" : ""}></label><div class="buttons"><button type="button" id="confirm-unlock" class="primary" ${this._verifying ? "disabled" : ""}>${this._verifying ? this._t("Verifying \u2026") : this._t("Unlock editing")}</button><button type="button" id="cancel-unlock">${esc2(this._t("Cancel"))}</button></div><span class="unlock-error" role="alert">${esc2(this._unlockError)}</span></form>` : ""}</section>`;
      }
      _ids() {
        return Object.fromEntries(Object.keys(FIELDS).map((key) => [key, this._config.entities?.[FIELDS[key][2]] || this._map[key] || ""]));
      }
      _state(id) {
        return this._hass?.states?.[id];
      }
      _toCelsius(id, value, delta = false) {
        const unit = this._state(id)?.attributes?.unit_of_measurement;
        return unit === "\xB0F" ? (value - (delta ? 0 : 32)) / 1.8 : unit === "K" ? value - (delta ? 0 : 273.15) : value;
      }
      _fromCelsius(id, value) {
        const unit = this._state(id)?.attributes?.unit_of_measurement;
        return unit === "\xB0F" ? value * 1.8 + 32 : unit === "K" ? value + 273.15 : value;
      }
      _num(id) {
        return good(this._state(id)) ? this._toCelsius(id, numeric(this._state(id).state)) : NaN;
      }
      _numberMeta(id) {
        const a = this._state(id)?.attributes || {};
        return {
          min: this._toCelsius(id, numeric(a.min)),
          max: this._toCelsius(id, numeric(a.max)),
          step: this._toCelsius(id, numeric(a.step), true)
        };
      }
      _editing() {
        return this._unlockOpen || this._selectInteracting || !!this.shadowRoot.activeElement?.matches("input, select");
      }
      async _discover() {
        if (!this._hass || !this._config || this._discovered || this._discovering) return;
        this._discovering = true;
        const revision = this._discoveryRevision;
        try {
          const { registry, devices } = await loadRegistry(this._hass, (text) => this._t(text));
          if (revision !== this._discoveryRevision) return;
          this._registry = registry;
          this._devices = devices;
          this._controllers = discoverControllers(registry, devices, (text) => this._t(text));
          this._registryError = "";
          this._applySelection();
        } catch (error) {
          if (revision !== this._discoveryRevision) return;
          this._registryError = error.message || String(error);
          this._applySelection();
        } finally {
          if (revision === this._discoveryRevision) {
            this._discovered = true;
            this._discovering = false;
            this._render();
          }
        }
      }
      _applySelection() {
        const cfg = this._config, explicit = cfg.entities || {};
        const anchors = Object.entries(explicit).filter(([key]) => !["outdoor_temperature", "flow_temperature", "flow_setpoint"].includes(key)).map(([, id]) => this._registry.find((e) => e.entity_id === id)).filter(Boolean);
        const entries = [...new Set(anchors.map((e) => e.config_entry_id).filter(Boolean))];
        this._bindingError = "";
        this._map = {};
        this._entryId = null;
        if (entries.length > 1) {
          this._bindingError = this._t("Control entities belong to different controllers. Check the card mapping.");
          return;
        }
        const entryPin = cfg.config_entry || entries[0] || "";
        const available = this._controllers.filter((c) => (!entryPin || c.id === entryPin) && (!cfg.serial || c.serial === cfg.serial));
        const controller = this._controllerId ? available.find((c) => c.id === this._controllerId) : available[0];
        if (!controller) {
          if (this._registryError && cfg.config_entry && explicit.curve_sensor) {
            this._entryId = cfg.config_entry;
            return;
          }
          this._bindingError = this._controllers.length ? this._t("The configured KeEnergy controller was not found. Check the card configuration.") : this._registryError ? this._t("Cannot read the KeEnergy mapping. Open as an administrator or set entities and config_entry manually.") : this._t("No KeEnergy heating circuit with a heating curve table found.");
          return;
        }
        if (entries.length && controller.id !== entries[0]) {
          this._bindingError = this._t("config_entry and the entity mapping belong to different controllers.");
          return;
        }
        const circuits = [...new Set(anchors.map(parseEntity).filter((p) => p?.circuit).map((p) => p.circuit))];
        if (circuits.length > 1) {
          this._bindingError = this._t("Control entities belong to different heating circuits.");
          return;
        }
        const circuitPin = cfg.circuit || circuits[0] || "";
        if (cfg.circuit && circuits.length && cfg.circuit !== circuits[0]) {
          this._bindingError = this._t("circuit and the entity mapping belong to different heating circuits.");
          return;
        }
        const wantedCircuit = circuitPin || this._circuitId;
        const circuit = wantedCircuit ? controller.circuits.find((c) => c.id === wantedCircuit) : controller.circuits[0];
        this._controllerId = controller.id;
        this._entryId = controller.id;
        if (!circuit) {
          this._bindingError = this._t("The selected heating circuit was not found on this controller.");
          return;
        }
        this._circuitId = circuit.id;
        this._map = { ...circuit.map };
        const unresolved = circuit.ambiguous.filter((key) => !explicit[FIELDS[key][2]]);
        if (unresolved.length) this._bindingError = this._t("Ambiguous entities: {keys}. Please set entities explicitly.", { keys: unresolved.join(", ") });
        for (const anchor of anchors) {
          if (anchor.platform !== "keba_keenergy") {
            this._bindingError = this._t("Control entities must come from keba_keenergy.");
            break;
          }
        }
      }
      _targetPanel() {
        const controller = this._controllers.find((c) => c.id === this._controllerId);
        const circuits = controller?.circuits || [];
        const pinned = !!(this._config.config_entry || this._config.serial || Object.keys(this._config.entities || {}).length);
        return `<section class="target-panel" aria-label="${esc2(this._t("Controller and heating circuit"))}"><label class="field">${esc2(this._t("Controller"))}<select id="controller-select" aria-label="${esc2(this._t("Controller"))}" ${this._busy || pinned || this._controllers.length < 2 ? "disabled" : ""}>${this._controllerId && !controller ? `<option value="${esc2(this._controllerId)}" selected>${esc2(this._t("Selected controller is missing"))}</option>` : ""}${this._controllers.length ? this._controllers.map((c) => `<option value="${esc2(c.id)}" ${c.id === this._controllerId ? "selected" : ""}>${esc2(c.label)}</option>`).join("") : `<option>${esc2(this._t("No controller found"))}</option>`}</select></label><label class="field">${esc2(this._t("Heating circuit"))}<select id="circuit-select" aria-label="${esc2(this._t("Heating circuit"))}" ${this._busy || !!this._config.circuit || Object.keys(this._config.entities || {}).length > 0 || circuits.length < 2 ? "disabled" : ""}>${this._circuitId && !circuits.some((c) => c.id === this._circuitId) ? `<option value="${esc2(this._circuitId)}" selected>${esc2(this._t("Selected heating circuit is missing"))}</option>` : ""}${circuits.length ? circuits.map((c) => `<option value="${esc2(c.id)}" ${c.id === this._circuitId ? "selected" : ""}>${esc2(c.label)}</option>`).join("") : `<option>${esc2(this._t("No heating circuit found"))}</option>`}</select></label><button type="button" id="reload-registry" ${this._busy ? "disabled" : ""}>${esc2(this._t("Rediscover"))}</button>${this._bindingError ? `<p class="target-error" role="alert">${esc2(this._bindingError)}</p>` : ""}${this._registryError ? `<p class="hint">${esc2(this._t("Registry: "))}${esc2(this._registryError)}</p>` : ""}</section>`;
      }
      _chooseTarget(kind, value) {
        this._selectInteracting = false;
        if (this._busy || this._draft || Object.keys(this._edits).length) {
          this._notice(this._t("Save changes or discard the draft before switching controller or heating circuit."));
          const el = this.shadowRoot.querySelector(kind === "controller" ? "#controller-select" : "#circuit-select");
          if (el) el.value = kind === "controller" ? this._controllerId : this._circuitId;
          return;
        }
        if (kind === "controller") {
          if (this._config.config_entry || this._config.serial || Object.keys(this._config.entities || {}).length || !this._controllers.some((c) => c.id === value)) return;
          this._controllerId = value;
          this._circuitId = "";
        } else {
          if (this._config.circuit || Object.keys(this._config.entities || {}).length || !this._controllers.find((c) => c.id === this._controllerId)?.circuits.some((c) => c.id === value)) return;
          this._circuitId = value;
        }
        this._loadingCurve = null;
        this._applySelection();
        this._message = this._t("View changed. No values were sent.");
        if (this._passwordCheck) this._lock(this._t("View changed. Please unlock editing again."));
        else
          this._render(true);
      }
      _readPoints() {
        const raw = this._state(this._ids().curve)?.attributes?.points;
        return Array.isArray(raw) ? raw.map((p) => ({ outdoor: numeric(p?.outdoor), flow: numeric(p?.flow) })) : [];
      }
      _selected() {
        const ids = this._ids();
        return good(this._state(ids.select)) ? this._state(ids.select).state : good(this._state(ids.curve)) ? this._state(ids.curve).state : "";
      }
      _options() {
        const options = this._state(this._ids().select)?.attributes?.options;
        return Array.isArray(options) ? options.filter((o) => typeof o === "string" && o.startsWith("HC")) : [];
      }
      _points() {
        return (this._draft?.name === this._selected() ? this._draft.points : this._readPoints()).map((p) => ({ ...p }));
      }
      _pointService() {
        return !!this._hass?.services?.keba_keenergy?.set_heating_curve_points;
      }
      _ready() {
        const ids = this._ids(), curve = this._state(ids.curve), options = this._options(), conflict = options.includes(curve?.state) && curve.state !== this._selected();
        return !this._bindingError && !!this._entryId && this._pointService() && !this._busy && !this._loadingCurve && this._selected().startsWith("HC") && good(curve) && Array.isArray(curve.attributes?.points) && !conflict;
      }
      _disabledEditors() {
        const ids = Object.values(this._ids());
        return this._registry.filter((e) => e.platform === "keba_keenergy" && e.config_entry_id === this._entryId && e.disabled_by && ids.includes(e.entity_id));
      }
      async _enableEditors() {
        if (this._busy || !this._requireEdit()) return;
        this._touchEdit();
        if (!this._hass?.user?.is_admin) {
          this._notice(this._t("Sign in as an administrator to enable disabled entities."));
          return;
        }
        if (!this._discovered) {
          await this._discover();
        }
        if (!this._requireEdit()) return;
        const disabled = this._disabledEditors();
        if (!disabled.length) {
          this._discovered = false;
          await this._discover();
          this._message = this._t("Entities reloaded. Missing values must be supported by the controller.");
          this._render();
          return;
        }
        this._busy = true;
        this._message = this._t("Enabling required entities \u2026");
        this._render();
        let count = 0;
        try {
          for (const entry of disabled) {
            if (!this._canEdit()) throw Error(this._t("Editing locked. Please unlock again."));
            await this._hass.callWS({ type: "config/entity_registry/update", entity_id: entry.entity_id, disabled_by: null });
            entry.disabled_by = null;
            count++;
          }
          this._message = this._t("{count} entities enabled. Home Assistant is loading their values; they will appear after the next update.", { count });
        } catch (error) {
          this._message = this._t("Enabling stopped after {count} entities: {error}. Sign in as an administrator or enable entities in the KeEnergy settings.", { count, error: error.message || error });
        } finally {
          this._busy = false;
          this._discovered = false;
          this._render();
          await this._discover();
        }
      }
      _fieldValue(key) {
        return Object.hasOwn(this._edits, key) ? this._edits[key] : this._num(this._ids()[key]);
      }
      _input(key) {
        const [, label, unit] = FIELDS2[key], id = this._ids()[key], s = this._state(id), v = this._fieldValue(key);
        const { min, max, step } = this._numberMeta(id);
        return `<label class="field">${esc2(this._t(label))}${unit ? " (" + unit + ")" : ""}<input data-setting="${key}" type="number" step="${Number.isFinite(step) && step > 0 ? step : "any"}" ${Number.isFinite(min) ? 'min="' + min + '"' : ""} ${Number.isFinite(max) ? 'max="' + max + '"' : ""} value="${Number.isFinite(v) ? v : ""}" ${!good(s) || this._busy || !!this._bindingError || !this._canEdit() ? "disabled" : ""}></label>`;
      }
      _chart() {
        const ids = this._ids();
        const valid = this._points().filter((p) => Number.isFinite(p.outdoor) && Number.isFinite(p.flow) && p.outdoor >= -40 && p.outdoor <= 40 && p.flow >= 10 && p.flow <= 90).sort((a, b) => a.outdoor - b.outdoor);
        const outside = this._num(ids.outdoor), target = this._num(ids.target), actual = this._num(ids.actual), day = this._fieldValue("limitDay"), night = this._fieldValue("limitNight");
        const minimum = this._config.flow_min ?? -Infinity, maximum = this._config.flow_max ?? Infinity;
        const clamp = (v) => Math.max(minimum, Math.min(maximum, v));
        const unique = valid.filter((p, i) => !i || p.outdoor !== valid[i - 1].outdoor);
        const { x_min, x_max, y_min, y_max } = this._config;
        const xStep = this._config.x_step ?? DEFAULT_AXIS_STEP;
        const yStep = this._config.y_step ?? DEFAULT_AXIS_STEP;
        const outdoorValues = valid.map((p) => p.outdoor);
        const flowValues = valid.map((p) => clamp(p.flow));
        const autoBottom = Math.floor(Math.min(15, minimum === -Infinity ? 15 : minimum, ...flowValues) / 5) * 5;
        const autoTop = Math.ceil(Math.max(60, maximum === Infinity ? 60 : maximum, ...flowValues) / 5) * 5;
        const outdoorRange = axisRange(x_min, x_max, Math.min(-20, ...outdoorValues), Math.max(30, ...outdoorValues));
        const flowRange = axisRange(y_min, y_max, autoBottom, autoTop);
        const { min: lo, max: hi } = outdoorRange;
        const { min: bottom, max: top } = flowRange;
        const x = (v) => 58 + (hi - v) / (hi - lo) * 580, y = (v) => 344 - (v - bottom) / (top - bottom) * 320;
        const visible = (outdoor, flow) => outdoor >= lo && outdoor <= hi && flow >= bottom && flow <= top;
        const tickLabel = (v) => esc2(this._number(v, { maximumFractionDigits: 2 }));
        let grid = "", limits = "", dots = "", samples = "", marks = "";
        for (const { value, showLabel } of axisTicks(outdoorRange, xStep, {
          fixedMin: x_min !== null,
          fixedMax: x_max !== null,
          length: 580,
          labelGap: 28
        })) {
          const px = x(value);
          grid += `<line x1="${px}" y1="24" x2="${px}" y2="344" class="grid"/>`;
          if (showLabel) grid += `<text x="${px}" y="365" text-anchor="middle">${tickLabel(value)}</text>`;
        }
        for (const { value, showLabel } of axisTicks(flowRange, yStep, {
          fixedMin: y_min !== null,
          fixedMax: y_max !== null,
          length: 320,
          labelGap: 13
        })) {
          const py = y(value);
          grid += `<line x1="58" y1="${py}" x2="638" y2="${py}" class="grid"/>`;
          if (showLabel) grid += `<text x="48" y="${py + 3}" text-anchor="end">${tickLabel(value)}</text>`;
        }
        [[day, "day", this._t("Day"), 16], [night, "night", this._t("Night"), 34]].forEach(([v, cls, label, labelY]) => {
          if (Number.isFinite(v) && v >= lo && v <= hi) limits += `<line x1="${x(v)}" y1="24" x2="${x(v)}" y2="344" class="limit ${cls}"/><text x="${Math.max(110, Math.min(585, x(v)))}" y="${labelY}" text-anchor="middle" class="limit-label">${esc2(this._t("HL"))} ${label} ${esc2(this._fmt(v))}</text>`;
        });
        [[minimum, "flow-min", this._t("Min")], [maximum, "flow-max", this._t("Max")]].filter(([v]) => v >= bottom && v <= top).forEach(([v, cls, label]) => limits += `<line x1="58" y1="${y(v)}" x2="638" y2="${y(v)}" class="limit ${cls}"/><text x="632" y="${y(v) - 7}" text-anchor="end" class="flow-limit-label ${cls}">${label} ${esc2(this._fmt(v))}</text>`);
        valid.forEach((p, i) => {
          const shown = clamp(p.flow);
          if (!visible(p.outdoor, shown)) return;
          const px = x(p.outdoor), py = y(shown), anchor = px <= 75 ? "start" : px >= 620 ? "end" : "middle";
          const label = shown > minimum && shown < maximum ? `<text x="${px}" y="${Math.max(17, py - 12)}" text-anchor="${anchor}" class="point-label">${this._number(shown, { minimumFractionDigits: 1 })}</text>` : "";
          dots += `<g><title>${esc2(this._t("P{index}: outdoor {outdoor} \xB0C \xB7 table {flow} \xB0C \xB7 limited display {shown} \xB0C", { index: i + 1, outdoor: this._number(p.outdoor, { minimumFractionDigits: 1 }), flow: this._number(p.flow, { minimumFractionDigits: 1 }), shown: this._number(shown, { minimumFractionDigits: 1 }) }))}</title><circle cx="${px}" cy="${py}" r="2.8" class="point"/>${label}</g>`;
        });
        if (unique.length > 1) {
          const intermediateStep = this._config.intermediate_step ?? INTERMEDIATE_STEP.default;
          const pointTemperatures = new Set(unique.map((point) => point.outdoor));
          const labelGap = 25;
          const sampleTicks = axisTicks(outdoorRange, intermediateStep, {
            fixedMin: false,
            fixedMax: false,
            length: 580,
            labelGap
          });
          for (const { value: outdoor, showLabel } of sampleTicks) {
            if (pointTemperatures.has(outdoor)) continue;
            const shown = clamp(interpolate(outdoor, unique));
            if (!visible(outdoor, shown) || shown <= minimum || shown >= maximum) continue;
            const px = x(outdoor), py = y(shown);
            const flowLabel = this._number(shown, { minimumFractionDigits: 1 });
            const label = showLabel && !unique.some((point) => Math.abs(x(point.outdoor) - px) < labelGap) ? `<text x="${px}" y="${Math.max(17, py - 9)}" text-anchor="middle" class="sample-label" data-outdoor="${outdoor}">${esc2(flowLabel)}</text>` : "";
            const tooltip = this._t("Interpolated value at {outdoor} \xB0C outdoors: {flow} \xB0C flow", {
              outdoor: this._number(outdoor, { maximumFractionDigits: 2 }),
              flow: flowLabel
            });
            samples += `<g><title>${esc2(tooltip)}</title><circle cx="${px}" cy="${py}" r="1.7" class="sample-point"/>${label}</g>`;
          }
        }
        [[target, "target"], [actual, "actual"]].forEach(([v, cls]) => {
          if (visible(outside, v)) marks += `<circle cx="${x(outside)}" cy="${y(v)}" r="${cls === "target" ? 3.8 : 3}" class="${cls}"/>`;
        });
        const xs = [lo, ...unique.map((p) => p.outdoor).filter((outdoor) => outdoor > lo && outdoor < hi), hi];
        const crossings = [];
        if (unique.length) for (let i = 0; i < xs.length - 1; i++) {
          const a = interpolate(xs[i], unique), b = interpolate(xs[i + 1], unique);
          for (const limit of [minimum, maximum]) {
            if ((a - limit) * (b - limit) < 0) crossings.push(xs[i] + (limit - a) / (b - a) * (xs[i + 1] - xs[i]));
          }
        }
        const path = unique.length ? [.../* @__PURE__ */ new Set([...xs, ...crossings])].sort((a, b) => a - b).map((v, i) => (i ? "L" : "M") + x(v) + "," + y(clamp(interpolate(v, unique)))).join(" ") : "";
        const dark = !!this._hass?.themes?.darkMode;
        const palette = `--curve-point-label:${dark ? "#D8AE8B" : "#9A6138"};--curve-sample-label:${dark ? "#9BACB8" : "#657B89"};--curve-line:${dark ? "#65B4B0" : "#278F89"}`;
        return `<svg viewBox="0 0 700 400" style="${palette}" aria-label="${esc2(this._t("Saved heating curve points, interpolated values and current flow temperatures"))}" role="img"><defs><clipPath id="${this._plotId}" clipPathUnits="userSpaceOnUse"><rect x="58" y="24" width="580" height="320"/></clipPath></defs><rect x="58" y="24" width="580" height="320" rx="8" class="plot"/><g class="axes">${grid}</g>${limits}<path d="${path}" class="curve" clip-path="url(#${this._plotId})"/>${samples}${dots}${marks}<g class="axes"><text x="348" y="393" text-anchor="middle">${esc2(this._t("Outdoor temperature"))} \xB0C</text><text x="15" y="184" text-anchor="middle" transform="rotate(-90 15 184)">${esc2(this._t("Flow \xB0C"))}</text></g></svg>`;
      }
      _preview() {
        const el = this.shadowRoot.querySelector("#chart");
        if (el) el.innerHTML = this._chart();
      }
      _refreshLive() {
        this._preview();
        const ids = this._ids();
        const values = {
          outdoor: this._fmt(this._num(ids.outdoor)),
          target: this._fmt(this._num(ids.target)),
          actual: this._fmt(this._num(ids.actual)),
          points: this._points().length
        };
        for (const [key, value] of Object.entries(values)) {
          const el = this.shadowRoot.querySelector('[data-live="' + key + '"]');
          if (el) el.textContent = String(value);
        }
        const message = this.shadowRoot.querySelector("#message");
        if (message) message.textContent = this._message || (this._loadingCurve ? this._t("Loading curve {name} \u2026", { name: this._loadingCurve }) : "");
      }
      _patchPoints(rows, ready, count, dirty) {
        const root = this.shadowRoot, table = root.querySelector(".table-wrap"), body = table?.querySelector("tbody");
        if (!body) return false;
        const top = table.scrollTop, left = table.scrollLeft;
        body.innerHTML = rows;
        table.scrollTop = top;
        table.scrollLeft = left;
        root.querySelector("#add-point").disabled = !ready || count >= 16;
        root.querySelector("#save-points").disabled = !ready;
        const label = root.querySelector("#curve-label");
        if (label) label.textContent = this._t("Point table") + (dirty ? this._t(" \xB7 Draft") : "");
        for (const key of Object.keys(FIELDS2)) {
          const input = root.querySelector('[data-setting="' + key + '"]'), value = this._fieldValue(key);
          if (input) input.value = Number.isFinite(value) ? String(value) : "";
        }
        this._bindPointRows();
        return true;
      }
      _render(force = false) {
        if (!this._config || !this._hass) return;
        if (!force && this._editing()) {
          this._pendingRender = true;
          this._refreshLive();
          return;
        }
        this._pendingRender = false;
        const ids = this._ids(), selected = this._selected(), select = this._state(ids.select), points = this._points();
        const canEdit = this._canEdit() && !this._bindingError, ready = this._ready() && canEdit, options = this._options();
        const tableState = this._state(ids.useCurve)?.state, missing = Object.entries(ids).filter(([, id]) => !good(this._state(id))).map(([key, id]) => id || FIELDS[key][2] + this._t(" (not mapped)")), dirty = !!this._draft;
        const disabled = this._disabledEditors();
        const mode = tableState === "on" ? this._t("Point table is in use") : tableState === "off" ? this._t("Hybrid active \xB7 saved point table") : this._t("Curve mode unavailable");
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
          controllers: this._controllers.map((c) => [c.id, c.label, c.circuits.map((h) => [h.id, h.label])]),
          bindingError: this._bindingError,
          registryError: this._registryError,
          pointService: this._pointService(),
          disabled: disabled.map((e) => [e.entity_id, e.disabled_by]),
          settings: Object.keys(FIELDS2).map((key) => {
            const s = this._state(ids[key]), a = s?.attributes || {};
            return [key, good(s), this._fieldValue(key), a.min, a.max, a.step];
          })
        };
        const viewKey = JSON.stringify(viewState), shellKey = JSON.stringify({
          ...viewState,
          points: void 0,
          dirty: void 0,
          settings: viewState.settings.map(([key, available, , ...bounds]) => [key, available, ...bounds])
        });
        if (!force && this._viewKey === viewKey) {
          this._refreshLive();
          return;
        }
        const previousTable = this.shadowRoot.querySelector(".table-wrap");
        const tableScroll = previousTable ? { top: previousTable.scrollTop, left: previousTable.scrollLeft } : null;
        const rows = points.map((p, i) => `<tr><td>${i + 1}</td><td><input data-point="${i}" data-axis="outdoor" type="number" step="any" min="-40" max="40" value="${Number.isFinite(p.outdoor) ? p.outdoor : ""}" ${!ready ? "disabled" : ""} aria-label="${esc2(this._t("Point {index} outdoor temperature", { index: i + 1 }))}"></td><td><input data-point="${i}" data-axis="flow" type="number" step="any" min="10" max="90" value="${Number.isFinite(p.flow) ? p.flow : ""}" ${!ready ? "disabled" : ""} aria-label="${esc2(this._t("Point {index} flow temperature", { index: i + 1 }))}"></td><td><button type="button" data-remove="${i}" ${!ready || points.length <= 1 ? "disabled" : ""} aria-label="${esc2(this._t("Remove point {index}", { index: i + 1 }))}">\xD7</button></td></tr>`).join("");
        if (!force && this._shellKey === shellKey && this._patchPoints(rows, ready, points.length, dirty)) {
          this._viewKey = viewKey;
          this._refreshLive();
          return;
        }
        const metric = (label, value, cls = "", key = "") => `<div class="metric ${cls}"><span>${label}</span><b data-live="${key}">${value}</b></div>`;
        this.shadowRoot.innerHTML = `<style>${STYLE}${EXTRA_STYLE}</style><ha-card>${this._targetPanel()}${this._lockPanel()}${disabled.length ? `<div class="setup"><b>${esc2(this._t("Enable editing"))}</b><p>${esc2(this._t("{count} required KeEnergy entities are disabled. An administrator can enable the required entities for this heating circuit.", { count: disabled.length }))}</p><button type="button" id="enable-editors" class="primary" ${this._busy || !canEdit || !this._hass?.user?.is_admin ? "disabled" : ""}>${esc2(this._t("Enable required entities"))}</button></div>` : ""}<div class="layout"><section class="chart-panel"><header><div><small>KEBA KEENERGY</small><h2>${esc2(this._config.title || this._t("KeEnergy heating curve"))}</h2><p>${esc2(mode)}</p></div><span class="badge">${esc2(selected || "\u2014")}</span></header><div id="chart">${this._chart()}</div><div class="legend"><span><i class="line"></i><span id="curve-label">${esc2(this._t("Point table"))}${dirty ? this._t(" \xB7 Draft") : ""}</span></span><span><i class="dot target"></i>${esc2(this._t("Controller target"))}</span><span><i class="dot actual"></i>${esc2(this._t("Actual flow"))}</span>${this._config.flow_min !== null || this._config.flow_max !== null ? `<span><i class="line flow-range"></i>${esc2(this._t("Flow min / max"))}</span>` : ""}<span><i class="dot interpolated"></i>${esc2(this._t("Interpolated values"))}</span></div><p class="notice">${this._config.flow_min !== null || this._config.flow_max !== null ? this._t("Display limits: ") + esc2(this._config.flow_min !== null ? this._fmt(this._config.flow_min) : this._t("no minimum")) + this._t(" to ") + esc2(this._config.flow_max !== null ? this._fmt(this._config.flow_max) : this._t("no maximum")) + this._t(". Limits apply to the chart only. ") : this._t("Saved table with linearly interpolated values. ")}${esc2(this._t("The controller target is read separately from KeEnergy."))}</p><div id="message" class="notice" role="status">${esc2(this._message || (this._loadingCurve ? this._t("Loading curve {name} \u2026", { name: this._loadingCurve }) : ""))}</div></section><aside><h3>${esc2(this._t("Select curve table"))}</h3><label class="field">${esc2(this._t("Curve table for this heating circuit"))}<select id="curve-select" aria-label="${esc2(this._t("Curve table for this heating circuit"))}" ${!good(select) || this._busy || !canEdit ? "disabled" : ""}>${selected && !options.includes(selected) ? `<option value="" selected>${esc2(this._t("Current: {name}", { name: selected }))}</option>` : ""}${options.length ? options.map((o) => `<option value="${esc2(o)}" ${o === selected ? "selected" : ""}>${esc2(o)}</option>`).join("") : `<option>${esc2(selected || this._t("No curves available"))}</option>`}</select></label><p class="hint">${esc2(this._t("Choose one of the heating tables (HC\u2026) offered by the controller. Selecting a table assigns it to this heating circuit. A table can be shared by several circuits on the same controller."))}</p><h3>${esc2(this._t("Current readings"))}</h3><div class="metrics">${metric(this._t("Outdoor temperature"), this._fmt(this._num(ids.outdoor)), "", "outdoor")}${metric(this._t("Target flow"), this._fmt(this._num(ids.target)), "target", "target")}${metric(this._t("Actual flow"), this._fmt(this._num(ids.actual)), "actual", "actual")}${metric(this._t("Points"), points.length, "", "points")}</div><h3>${esc2(this._t("Day / night heating limits"))}</h3><div class="limit-fields">${Object.keys(FIELDS2).map((k) => this._input(k)).join("")}</div><button class="primary" id="save-settings" ${this._busy || !canEdit ? "disabled" : ""}>${esc2(this._t("Save heating limits"))}</button></aside></div><section class="editor"><div class="editor-head"><div><h3>${esc2(this._t("Edit curve points"))}</h3><p>${esc2(this._t("1 to 16 points. The preview updates as you type. The table is sent only when you select \u201CSave points\u201D."))}</p></div><div class="buttons"><button type="button" id="reset" ${this._busy || !this._canEdit() ? "disabled" : ""}>${esc2(this._t("Discard draft"))}</button><button type="button" id="add-point" ${!ready || points.length >= 16 ? "disabled" : ""}>${esc2(this._t("Add point"))}</button><button type="button" id="save-points" class="primary" ${!ready ? "disabled" : ""}>${esc2(this._t("Save points"))}</button></div></div><div class="table-wrap"><table><thead><tr><th>#</th><th>${esc2(this._t("Outdoor \xB0C"))}</th><th>${esc2(this._t("Flow \xB0C"))}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>${missing.length || !this._entryId || !this._pointService() ? `<details open><summary>${esc2(this._t("Check entities / setup"))}</summary>${missing.length ? `<p>${esc2(this._t("These entities are missing or do not yet provide values:"))}</p>` : ""}<ul>${missing.map((id) => `<li><code>` + esc2(id) + `</code></li>`).join("")}</ul>${!this._entryId ? `<p>${esc2(this._t("Integration entry not found yet. Optionally set config_entry in the card."))}</p>` : ""}${!this._pointService() ? `<p>${esc2(this._t("The keba_keenergy.set_heating_curve_points action is unavailable. The integration must support editing curve points."))}</p>` : ""}<button type="button" id="retry">${esc2(this._t("Reload mapping"))}</button></details>` : ""}<p class="hint">${esc2(this._t("KeEnergy heating curve \xB7 General version 1.1.0"))}</p></section></ha-card>`;
        this._viewKey = viewKey;
        this._shellKey = shellKey;
        this._bind();
        const table = this.shadowRoot.querySelector(".table-wrap");
        if (table && tableScroll) {
          table.scrollTop = tableScroll.top;
          table.scrollLeft = tableScroll.left;
        }
      }
      _notice(message) {
        this._message = message;
        const el = this.shadowRoot.querySelector("#message");
        if (el) el.textContent = message;
      }
      _bindPointRows() {
        const root = this.shadowRoot;
        root.querySelectorAll("[data-point]").forEach((el) => el.addEventListener("input", () => {
          if (!this._canEdit() || this._busy) return;
          this._touchEdit();
          if (!this._draft) this._draft = { name: this._selected(), points: this._readPoints() };
          this._draft.saved = false;
          this._draft.points[Number(el.dataset.point)][el.dataset.axis] = numeric(el.value);
          this._notice(this._t("Points changed \xB7 not saved yet"));
          this._preview();
        }));
        root.querySelectorAll("[data-remove]").forEach((el) => el.addEventListener("click", () => {
          const p = this._points();
          if (!this._canEdit() || !this._ready() || p.length <= 1) return;
          this._touchEdit();
          p.splice(Number(el.dataset.remove), 1);
          this._draft = { name: this._selected(), points: p };
          this._render();
        }));
      }
      _bind() {
        const root = this.shadowRoot;
        const on = (selector, event, fn) => root.querySelector(selector)?.addEventListener(event, fn);
        this._bindPointRows();
        for (const [selector, kind] of [["#controller-select", "controller"], ["#circuit-select", "circuit"]]) {
          on(selector, "pointerdown", (e) => {
            if (e.button === 0 && !e.target.disabled) this._selectInteracting = true;
          });
          on(selector, "focus", () => {
            this._selectInteracting = true;
          });
          on(selector, "blur", () => {
            this._selectInteracting = false;
          });
          on(selector, "change", (e) => {
            const value = e.target.value;
            this._selectInteracting = false;
            e.target.blur();
            this._chooseTarget(kind, value);
          });
        }
        on("#reload-registry", "click", () => {
          if (this._busy) return;
          this._discovered = false;
          this._discover();
        });
        on("#unlock-editor", "click", () => this._openUnlock());
        on("#lock-editor", "click", () => this._lock());
        on("#cancel-unlock", "click", () => this._lock(this._t("Editing locked.")));
        on("#confirm-unlock", "click", (event) => this._submitUnlock(event));
        on("#unlock-form", "submit", (event) => this._submitUnlock(event));
        on("#edit-password", "keydown", (event) => {
          if (event.key === "Enter") return this._submitUnlock(event);
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            this._lock(this._t("Editing locked."));
          }
        });
        root.querySelectorAll("[data-setting]").forEach((el) => el.addEventListener("input", () => {
          if (!this._canEdit() || this._busy) return;
          this._touchEdit();
          this._edits[el.dataset.setting] = numeric(el.value);
          this._notice(this._t("Settings changed \xB7 not saved yet"));
          this._preview();
        }));
        on("#curve-select", "pointerdown", (e) => {
          if (e.button === 0 && !e.target.disabled) this._selectInteracting = true;
        });
        on("#curve-select", "focus", () => {
          this._selectInteracting = true;
        });
        on("#curve-select", "blur", () => {
          this._selectInteracting = false;
        });
        on("#curve-select", "change", (e) => {
          const value = e.target.value;
          this._selectInteracting = false;
          e.target.blur();
          return this._select(value);
        });
        on("#reset", "click", () => {
          if (!this._canEdit() || this._busy) return;
          this._touchEdit();
          this._draft = null;
          this._edits = {};
          this._message = this._t("Draft discarded.");
          this._render();
        });
        on("#retry", "click", () => {
          this._discovered = false;
          this._registryError = null;
          this._discover();
        });
        on("#enable-editors", "click", () => this._enableEditors());
        on("#add-point", "click", () => {
          const p = this._points();
          if (!this._canEdit() || !this._ready() || p.length >= 16) return;
          this._touchEdit();
          let outdoor = 0;
          while (p.some((v) => v.outdoor === outdoor) && outdoor <= 40) outdoor += 5;
          if (outdoor > 40) {
            outdoor = -5;
            while (p.some((v) => v.outdoor === outdoor) && outdoor >= -40) outdoor -= 5;
          }
          if (outdoor < -40) outdoor = 1;
          p.push({ outdoor, flow: 30 });
          this._draft = { name: this._selected(), points: p };
          this._message = this._t("Point added \xB7 not saved yet");
          this._render();
        });
        on("#save-points", "click", () => this._savePoints());
        on("#save-settings", "click", () => this._saveSettings());
      }
      async _select(name) {
        if (this._busy || !this._requireEdit()) return;
        this._touchEdit();
        if (this._draft || Object.keys(this._edits).length) {
          this._notice(this._t("Save points / settings or discard the draft before switching tables."));
          this._render();
          return;
        }
        if (!this._options().includes(name)) return;
        this._loadingCurve = name;
        this._busy = true;
        this._message = this._t("Assigning curve \u2026");
        this._render();
        try {
          await this._hass.callService("select", "select_option", { entity_id: this._ids().select, option: name });
          this._message = this._t("Curve {name} assigned. Readings are updating.", { name });
        } catch (error) {
          this._loadingCurve = null;
          this._message = this._t("Selection failed: ") + (error.message || error);
        } finally {
          this._busy = false;
          const ids = this._ids();
          if (this._state(ids.curve)?.state === name && this._selected() === name) this._loadingCurve = null;
          this._render();
        }
      }
      async _savePoints() {
        if (!this._requireEdit() || !this._ready()) return;
        this._touchEdit();
        if (!this._entryId) {
          this._discovered = false;
          await this._discover();
          if (!this._entryId) {
            this._notice(this._t("Cannot determine the integration entry. Set config_entry in the card configuration."));
            return;
          }
        }
        if (!this._requireEdit()) return;
        const name = this._selected();
        const points = this._points().map((p) => ({ outdoor: Math.round(p.outdoor * 100) / 100, flow: Math.round(p.flow * 100) / 100 })).sort((a, b) => a.outdoor - b.outdoor);
        if (points.length < 1 || points.length > 16 || points.some((p, i) => !Number.isFinite(p.outdoor) || !Number.isFinite(p.flow) || p.outdoor < -40 || p.outdoor > 40 || p.flow < 10 || p.flow > 90 || i > 0 && p.outdoor <= points[i - 1].outdoor)) {
          this._notice(this._t("Invalid points: outdoor \u221240 to 40 \xB0C, flow 10 to 90 \xB0C; outdoor temperatures must be unique."));
          return;
        }
        const live = this._readPoints().sort((a, b) => a.outdoor - b.outdoor);
        if (JSON.stringify(points) === JSON.stringify(live)) {
          this._draft = null;
          this._message = this._t("No changes to the points.");
          this._render();
          return;
        }
        this._busy = true;
        this._message = this._t("Saving points \u2026");
        this._render();
        try {
          await this._hass.callService("keba_keenergy", "set_heating_curve_points", { config_entry: this._entryId, heating_curve: name, points });
          this._draft = this._canEdit() ? { name, points, saved: true } : null;
          this._message = this._t("Points for {name} sent. Controller readings are updating.", { name });
          if (JSON.stringify(points) === JSON.stringify(this._readPoints().sort((a, b) => a.outdoor - b.outdoor))) {
            this._draft = null;
          }
        } catch (error) {
          this._message = this._t("Save failed: ") + (error.message || error);
        } finally {
          this._busy = false;
          this._render();
        }
      }
      async _saveSettings() {
        if (this._busy || !this._requireEdit()) return;
        this._touchEdit();
        const ids = this._ids(), changes = Object.entries(this._edits);
        for (const [key, value] of changes) {
          const s = this._state(ids[key]), { min, max, step } = this._numberMeta(ids[key]);
          const steps = (value - (Number.isFinite(min) ? min : 0)) / step;
          if (!good(s) || !Number.isFinite(value) || Number.isFinite(min) && value < min - 1e-6 || Number.isFinite(max) && value > max + 1e-6 || Number.isFinite(step) && step > 0 && Math.abs(steps - Math.round(steps)) > 1e-6) {
            this._notice(this._t("Invalid value for {field}. Observe the entity\u2019s range and step size.", { field: this._t(FIELDS2[key][1]) }));
            return;
          }
        }
        if (!changes.length) {
          this._notice(this._t("No settings changed."));
          return;
        }
        this._busy = true;
        this._message = this._t("Saving settings \u2026");
        this._render();
        let saved = 0;
        try {
          for (const [key, value] of changes) {
            if (!this._canEdit()) throw Error(this._t("Editing locked. Please unlock again."));
            if (Math.abs(this._num(ids[key]) - value) > 1e-6) {
              await this._hass.callService("number", "set_value", { entity_id: ids[key], value: Math.round(this._fromCelsius(ids[key], value) * 1e8) / 1e8 });
              saved++;
            }
            delete this._edits[key];
          }
          this._message = this._t("{count} settings sent. The next update will show the controller values.", { count: saved });
        } catch (error) {
          this._message = this._t("Partially saved ({count}). Remaining changes were not sent: {error}", { count: saved, error: error.message || error });
        } finally {
          this._busy = false;
          this._render();
        }
      }
    }
    const STYLE = ":host{display:block;container-type:inline-size;font-family:var(--primary-font-family,Arial,sans-serif);color:var(--primary-text-color,#203b44);--muted:var(--secondary-text-color,#7a8c96);--panel:var(--card-background-color,#fff);--border:var(--divider-color,#e1e9ec)}*{box-sizing:border-box}ha-card{overflow:hidden;border-radius:20px}.layout{display:grid;grid-template-columns:minmax(0,2.1fr) minmax(270px,1fr);gap:16px;padding:16px;background:var(--secondary-background-color,#eef3f4)}.chart-panel,.editor{min-width:0;background:var(--panel);border:1px solid var(--border);border-radius:17px;padding:16px}header,.editor-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 8px 14px}header small{font-size:10px;font-weight:800;letter-spacing:.14em;color:#138e90}h2{margin:6px 0;font-size:25px}header p,.editor-head p{margin:0;font-size:12px;color:var(--muted)}.badge{padding:7px 12px;border-radius:9px;background:#e4f2f0;color:#087f82;font-size:11px;font-weight:750}svg{display:block;width:100%;height:auto}.plot{fill:var(--panel);stroke:var(--border)}.grid{stroke:var(--border);stroke-width:.7;opacity:.65}.curve{fill:none;stroke:#138e90;stroke-width:3;stroke-linejoin:round;stroke-linecap:round}.axes{fill:var(--muted);font-size:10px}.axis-title{font-size:11px;font-weight:600}.point{fill:#138e90;stroke:var(--panel);stroke-width:2}.point-label{fill:#087f82;font-size:10px;font-weight:bold;paint-order:stroke;stroke:var(--panel);stroke-width:3px}.limit{stroke-width:1.4;stroke-dasharray:5 4;opacity:.85}.limit.day{stroke:#72934b}.limit.night{stroke:#7885b0}.limit-label{fill:var(--muted);font-size:9px;font-weight:bold;paint-order:stroke;stroke:var(--panel);stroke-width:3px}.target{fill:var(--panel);stroke:#3b82f6;stroke-width:2.5}.actual{fill:#e99a4a;stroke:var(--panel);stroke-width:1.5}.legend{display:flex;flex-wrap:wrap;justify-content:center;gap:15px;padding:12px 4px 0;font-size:11px;color:var(--muted)}.legend span{display:flex;align-items:center;gap:5px}.line{width:16px;height:3px;border-radius:3px;background:#138e90}.line.pale{background:#92a5b5}.dot{width:8px;height:8px;border-radius:50%}.dot.target{border:2px solid #3b82f6}.dot.actual{background:#e99a4a}aside{min-width:0}h3{margin:5px 2px 10px;font-size:12px;color:var(--muted);letter-spacing:.03em}.field{display:grid;gap:5px;font-size:11px;color:var(--muted)}select,input{min-width:0;width:100%;padding:9px 10px;border:1px solid var(--border);border-radius:9px;background:var(--panel);color:var(--primary-text-color,#203b44);font:inherit}.curve-status{min-height:20px;margin:5px 2px 12px;font-size:10px;color:var(--muted)}.metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:14px}.metric{display:grid;gap:8px;min-height:75px;padding:12px;border:1px solid var(--border);border-radius:13px;background:var(--panel)}.metric span{font-size:10px;color:var(--muted)}.metric b{font-size:21px;white-space:nowrap;font-variant-numeric:tabular-nums}.metric.target{background:#eaf6f2;color:#087f82}.metric.actual{background:#fff6eb;color:#ac6b24}.limit-fields{display:grid;grid-template-columns:1fr 1fr;gap:9px}.limit-fields label{display:grid;gap:5px;font-size:11px;color:var(--muted)}button{border:1px solid var(--border);border-radius:9px;padding:9px 12px;background:var(--panel);color:var(--primary-text-color,#203b44);font:inherit;font-size:11px;font-weight:700;cursor:pointer}button:hover:not(:disabled){border-color:#138e90;color:#087f82}button:disabled{opacity:.45;cursor:not-allowed}.primary{background:#138e90;border-color:#138e90;color:#fff}.primary:hover:not(:disabled){background:#087f82;color:#fff}#save-limits{width:100%;margin-top:9px}.notice{margin:12px 2px 0;padding:10px 12px;border-radius:10px;background:var(--secondary-background-color,#eef3f4);color:var(--muted);font-size:11px;line-height:1.5;overflow-wrap:anywhere}.editor{margin:0 16px 16px}.editor-head{padding:0 0 12px}.editor-head h3{margin:0 0 5px;color:var(--primary-text-color,#203b44)}.buttons{display:flex;gap:8px;flex-wrap:wrap}.table-wrap{max-height:390px;overflow:auto}table{width:100%;border-collapse:collapse;font-size:11px}th,td{padding:7px 8px;text-align:left;border-bottom:1px solid var(--border)}th{position:sticky;top:0;background:var(--panel);color:var(--muted);font-weight:600}td input{padding:7px}.remove{padding:5px 9px;font-size:17px;color:#a54b4b}@container(max-width:760px){.layout{grid-template-columns:1fr}}@container(max-width:440px){.layout{padding:8px;gap:10px}.chart-panel,.editor{padding:12px}.editor{margin:0 8px 8px}.editor-head{align-items:flex-start;flex-direction:column}.metric{padding:9px}.metric b{font-size:18px}.buttons{width:100%}.buttons button{flex:1}}";
    const EXTRA_STYLE = `
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
    if (!customElements.get("keba-keenergy-heating-curve-card")) customElements.define("keba-keenergy-heating-curve-card", KeEnergyHeatingCurveCard);
    window.customCards = window.customCards || [];
    if (!window.customCards.some((c) => c.type === "keba-keenergy-heating-curve-card")) window.customCards.push({ type: "keba-keenergy-heating-curve-card", name: "KEBA KeEnergy Heating Curve Card", description: "Heating curves and limits with automatic discovery \xB7 Deutsch / English", preview: false });
  })();
})();
