// English source messages with a complete German catalog. Entity IDs, table names
// and user-supplied labels are data and must never be passed through this catalog.

/**
 * German translations of the English source texts.
 *
 * @type {Record<string, string>}
 */
export const DE = {
  'Heating curve': 'Heizkurve',
  'Heating circuit': 'Heizkreis',
  'Controller': 'Regler',
  'Controller and heating circuit': 'Regler und Heizkreis',
  'Selected controller is missing': 'Gewählter Regler fehlt',
  'No controller found': 'Kein Regler gefunden',
  'Selected heating circuit is missing': 'Gewählter Heizkreis fehlt',
  'No heating circuit found': 'Kein Heizkreis gefunden',
  'Rediscover': 'Neu erkennen',
  'Registry: ': 'Verzeichnis: ',
  'Password protection': 'Kennwortschutz',
  'Password': 'Kennwort',
  'Editing unlocked': 'Einstellungen freigegeben',
  'Editing locked': 'Einstellungen gesperrt',
  'Locks automatically after {minutes} minutes without editing.': 'Automatische Sperre nach {minutes} Minuten ohne Bearbeitung.',
  'Unlock to change the curve table, points and heating limits.': 'Zum Ändern von Kurventabelle, Punkten und Heizgrenzen entsperren.',
  'Lock': 'Sperren',
  'Unlock': 'Entsperren',
  'Verifying …': 'Wird geprüft …',
  'Unlock editing': 'Bearbeitung freigeben',
  'Cancel': 'Abbrechen',
  'Editing locked.': 'Bearbeitung gesperrt.',
  'Editing is locked. Please enter the password to unlock.': 'Einstellungen gesperrt. Bitte mit Kennwort entsperren.',
  'Locked automatically after inactivity. Unsaved changes discarded.': 'Nach Inaktivität automatisch gesperrt. Ungespeicherte Änderungen verworfen.',
  'Editing locked. Unsaved changes discarded.': 'Bearbeitung gesperrt. Ungespeicherte Änderungen verworfen.',
  'Please enter the password.': 'Bitte Kennwort eingeben.',
  'Incorrect password.': 'Kennwort ist nicht korrekt.',
  'Editing unlocked.': 'Bearbeitung freigegeben.',
  'Password verification failed. Please try again.': 'Kennwortprüfung fehlgeschlagen. Bitte erneut versuchen.',
  'entities must be a mapping.': 'entities muss eine Zuordnung sein.',
  'circuit must be a heating circuit number starting at 1.': 'circuit muss eine Heizkreisnummer ab 1 sein.',
  'Invalid entity mapping: ': 'Ungültige Entitätszuordnung: ',
  'edit_password_hash must be a valid PBKDF2-SHA256 verifier. Create one in the visual editor.': 'edit_password_hash muss ein gültiger PBKDF2-SHA256-Prüfwert sein. Im visuellen Editor kann er erstellt werden.',
  'auto_lock_minutes must be between 1 and 60 minutes.': 'auto_lock_minutes muss zwischen 1 und 60 Minuten liegen.',
  '{key} must be between 10 and 90 °C or empty.': '{key} muss zwischen 10 und 90 °C liegen oder leer sein.',
  'flow_min must be less than flow_max.': 'flow_min muss kleiner als flow_max sein.',
  '{key} must be between {min} and {max} °C and have at most two decimal places.': '{key} muss zwischen {min} und {max} °C liegen und darf höchstens zwei Nachkommastellen haben.',
  '{minKey} must be less than {maxKey}.': '{minKey} muss kleiner als {maxKey} sein.',
  'language must be auto, de or en.': 'language muss auto, de oder en sein.',
  'Control entities belong to different controllers. Check the card mapping.': 'Die Steuerungs-Entitäten stammen aus verschiedenen Reglern. Zuordnung in der Karte prüfen.',
  'The configured KEBA KeEnergy controller was not found. Check the card configuration.': 'Der konfigurierte KEBA-KeEnergy-Regler wurde nicht gefunden. Kartenkonfiguration prüfen.',
  'Cannot read the KEBA KeEnergy mapping. Open as an administrator or set entities and config_entry manually.': 'KEBA-KeEnergy-Zuordnung nicht lesbar. Als Administrator öffnen oder Entitäten und config_entry manuell zuordnen.',
  'No KEBA KeEnergy heating circuit with a heating curve table found.': 'Kein KEBA-KeEnergy-Heizkreis mit Heizkurventabelle gefunden.',
  'config_entry and the entity mapping belong to different controllers.': 'config_entry und Entitätszuordnung gehören zu verschiedenen Reglern.',
  'Control entities belong to different heating circuits.': 'Die Steuerungs-Entitäten gehören zu verschiedenen Heizkreisen.',
  'circuit and the entity mapping belong to different heating circuits.': 'circuit und Entitätszuordnung gehören zu verschiedenen Heizkreisen.',
  'The selected heating circuit was not found on this controller.': 'Der gewählte Heizkreis wurde an diesem Regler nicht gefunden.',
  'Ambiguous entities: {keys}. Please set entities explicitly.': 'Mehrdeutige Entitäten: {keys}. Bitte entities ausdrücklich zuordnen.',
  'Control entities must come from keba_keenergy.': 'Steuerungs-Entitäten müssen aus keba_keenergy stammen.',
  'Save changes or discard the draft before switching controller or heating circuit.': 'Vor dem Regler- oder Heizkreiswechsel Änderungen speichern oder den Entwurf verwerfen.',
  'View changed. No values were sent.': 'Ansicht gewechselt. Es wurden keine Werte übertragen.',
  'View changed. Please unlock editing again.': 'Ansicht gewechselt. Bearbeitung bitte erneut entsperren.',
  'Sign in as an administrator to enable disabled entities.': 'Zum Aktivieren deaktivierter Entitäten als Administrator anmelden.',
  'Enabling required entities …': 'Bearbeitungs-Entitäten werden aktiviert …',
  'Editing locked. Please unlock again.': 'Bearbeitung gesperrt. Erneut entsperren.',
  '{count} entities enabled. Home Assistant is loading their values; they will appear after the next update.': '{count} Entitäten aktiviert. Home Assistant lädt die Werte; sie erscheinen nach dem nächsten Update.',
  'Enabling stopped after {count} entities: {error}. Sign in as an administrator or enable entities in the KEBA KeEnergy settings.': 'Aktivierung nach {count} Entitäten gestoppt: {error}. Als Administrator anmelden oder Entitäten in den KEBA-KeEnergy-Einstellungen aktivieren.',
  'Day heating limit': 'Heizgrenze Tag',
  'Night heating limit': 'Heizgrenze Nacht',
  'Min': 'Min',
  'Max': 'Max',
  'Outdoor temperature': 'Außentemperatur',
  'Curve table selection': 'Auswahl der Kurventabelle',
  'Curve table points': 'Punkte der Kurventabelle',
  'Curve mode': 'Kurvenart',
  'Flow': 'Vorlauf',
  'P{index}: outdoor {outdoor} °C · table {flow} °C · limited display {shown} °C': 'P{index}: Außen {outdoor} °C · Tabelle {flow} °C · begrenzte Anzeige {shown} °C',
  'Interpolated value at {outdoor} °C outdoors: {flow} °C flow': 'Zwischenwert bei {outdoor} °C außen: {flow} °C Vorlauf',
  'Saved heating curve points, interpolated values and current flow temperatures': 'Gespeicherte Heizkurvenpunkte, berechnete Zwischenwerte und aktuelle Vorlauftemperaturen',
  'Remove point {index}': 'Punkt {index} entfernen',
  'Point table': 'Punkttabelle',
  ' · Draft': ' · Entwurf',
  'Loading curve {name} …': 'Kurve {name} wird geladen …',
  ' (not mapped)': ' (nicht zugeordnet)',
  'Point table is in use': 'Punkttabelle wird verwendet',
  'Hybrid active · saved point table': 'Hybrid aktiv · gespeicherte Punkttabelle',
  'Curve mode unavailable': 'Kurvenart nicht verfügbar',
  'Enable editing': 'Bearbeitung aktivieren',
  '{count} required KEBA KeEnergy entities are disabled. An administrator can enable the required entities for this heating circuit.': '{count} benötigte KEBA-KeEnergy-Entitäten sind deaktiviert. Als Administrator kannst du die benötigten Entitäten dieses Heizkreises aktivieren.',
  'Enable required entities': 'Bearbeitungs-Entitäten aktivieren',
  'Controller target': 'Regler-Soll',
  'Actual flow': 'Vorlauf Ist',
  'Flow min / max': 'Vorlauf Min / Max',
  'Interpolated values': 'Zwischenwerte',
  'Display limits: ': 'Darstellung begrenzt: ',
  'no minimum': 'ohne Minimum',
  'no maximum': 'ohne Maximum',
  ' to ': ' bis ',
  '. Limits apply to the chart only. ': '. Die Begrenzung gilt nur für das Diagramm. ',
  'Saved table with linearly interpolated values. ': 'Gespeicherte Tabelle mit linear berechneten Zwischenwerten. ',
  'The controller target is read separately from KEBA KeEnergy.': 'Der Regler-Sollwert wird separat aus KEBA KeEnergy gelesen.',
  'Select curve table': 'Kurventabelle auswählen',
  'Curve table for this heating circuit': 'Kurventabelle für diesen Heizkreis',
  'Current: {name}': 'Aktuell: {name}',
  'No curves available': 'Keine Kurven verfügbar',
  'Choose one of the heating tables (HC…) offered by the controller. Selecting a table assigns it to this heating circuit. A table can be shared by several circuits on the same controller.': 'Die vom Regler angebotenen Heiztabellen (HC…) stehen hier zur Auswahl. Die Auswahl weist sie dem Heizkreis zu. Eine Tabelle kann von mehreren Heizkreisen desselben Reglers gemeinsam verwendet werden.',
  'Unavailable': 'Nicht verfügbar',
  'Unknown': 'Unbekannt',
  'Current readings': 'Aktuelle Werte',
  'Target flow': 'Vorlauf Soll',
  'Points': 'Punkte',
  'Heating limits': 'Heizgrenzen',
  'Save heating limits': 'Heizgrenzen speichern',
  'Edit curve points': 'Kurvenpunkte bearbeiten',
  '1 to 16 points. The preview updates as you type. The table is sent only when you select “Save points”.': '1 bis 16 Punkte. Die Vorschau aktualisiert sich beim Eingeben. Erst „Punkte speichern“ überträgt die Tabelle.',
  'Discard draft': 'Entwurf verwerfen',
  'Add point': 'Punkt hinzufügen',
  'Save points': 'Punkte speichern',
  'Outdoor °C': 'Außen °C',
  'Flow °C': 'Vorlauf °C',
  'Check entities / setup': 'Entitäten / Einrichtung prüfen',
  'These entities are missing or do not yet provide values:': 'Diese Entitäten fehlen oder liefern noch keine Werte:',
  'Integration entry not found yet. Optionally set config_entry in the card.': 'Konfigurationseintrag noch nicht gefunden. Optional config_entry in der Karte angeben.',
  'The keba_keenergy.set_heating_curve_points action is unavailable. The integration must support editing curve points.': 'Die Aktion keba_keenergy.set_heating_curve_points ist nicht verfügbar. Die Integration muss das Bearbeiten von Kurvenpunkten unterstützen.',
  'Reload mapping': 'Zuordnung erneut laden',
  'KEBA KeEnergy heating curve · General version {version}': 'KEBA KeEnergy Heizkurve · Allgemeine Version {version}',
  'Points changed · not saved yet': 'Punkte geändert · noch nicht gespeichert',
  'Settings changed · not saved yet': 'Parameter geändert · noch nicht gespeichert',
  'Draft discarded.': 'Entwurf verworfen.',
  'Point added · not saved yet': 'Punkt hinzugefügt · noch nicht gespeichert',
  'Save points / settings or discard the draft before switching tables.': 'Vor dem Tabellenwechsel Punkte / Parameter speichern oder den Entwurf verwerfen.',
  'Assigning curve …': 'Kurve wird zugewiesen …',
  'Curve {name} assigned. Readings are updating.': 'Kurve {name} zugewiesen. Messwerte werden aktualisiert.',
  'Selection failed: ': 'Auswahl fehlgeschlagen: ',
  'Invalid points: outdoor −40 to 40 °C, flow 10 to 90 °C; outdoor temperatures must be unique.': 'Ungültige Punkte: Außen −40 bis 40 °C, Vorlauf 10 bis 90 °C; Außentemperaturen müssen eindeutig sein.',
  'No changes to the points.': 'Keine Änderungen an den Punkten.',
  'Saving points …': 'Punkte werden gespeichert …',
  'Save failed: ': 'Speichern fehlgeschlagen: ',
  'Invalid value for {field}. Observe the entity’s range and step size.': 'Ungültiger Wert für {field}. Zulässigen Bereich und Schrittweite der Entität beachten.',
  'No settings changed.': 'Keine Parameter geändert.',
  'Saving settings …': 'Parameter werden gespeichert …',
  'Partially saved ({count}). Remaining changes were not sent: {error}': 'Teilweise gespeichert ({count}). Weitere Änderungen nicht übertragen: {error}',
  'Title': 'Titel',
  'Pin controller': 'Regler fest zuordnen',
  'Pin heating circuit': 'Heizkreis fest zuordnen',
  'Automatic · selectable in the dashboard': 'Automatisch · im Dashboard auswählbar',
  'Without a fixed mapping, select the controller and heating circuit in the card. Switching the view sends no commands.': 'Ohne feste Zuordnung werden Regler und Heizkreis direkt in der Karte gewählt. Das Umschalten der Ansicht sendet keine Befehle.',
  'Chart axes': 'Diagrammachsen',
  'Automatic': 'Automatisch',
  'X-axis · Outdoor temperature': 'X-Achse · Außentemperatur',
  'Y-axis · Flow temperature': 'Y-Achse · Vorlauftemperatur',
  'Minimum (°C)': 'Minimum (°C)',
  'Maximum (°C)': 'Maximum (°C)',
  'Grid interval (°C)': 'Rasterweite (°C)',
  'Interpolated value interval on the X-axis (°C)': 'Abstand der Zwischenwerte auf der X-Achse (°C)',
  'Empty bounds are set automatically. The default grid interval is 5 °C. These settings only change the visible chart range and grid.': 'Leere Grenzen werden automatisch bestimmt. Die Standard-Rasterweite beträgt 5 °C. Diese Einstellungen ändern nur den sichtbaren Diagrammausschnitt und das Raster.',
  'Chart flow limits': 'Vorlaufbegrenzungen im Diagramm',
  'Leave empty to show the unmodified table. These values limit the display only and are not sent to the controller.': 'Leer lassen für die unveränderte Tabelle. Diese Werte begrenzen nur die Darstellung und werden nicht an den Regler übertragen.',
  'Display minimum (°C)': 'Anzeige Minimum (°C)',
  'Display maximum (°C)': 'Anzeige Maximum (°C)',
  'Configured': 'Eingerichtet',
  'Optional': 'Optional',
  'Set your own password. Only the verifier is stored in the card configuration. Protection applies to this card interface; Home Assistant permissions still apply.': 'Jeder richtet sein eigenes Kennwort ein. Nur der Prüfwert wird in der Kartenkonfiguration gespeichert. Der Schutz gilt für diese Kartenoberfläche; Home-Assistant-Berechtigungen gelten weiterhin.',
  'New password': 'Neues Kennwort',
  'Repeat password': 'Kennwort wiederholen',
  'Set password': 'Kennwort einrichten',
  'Remove password protection': 'Kennwortschutz entfernen',
  'Auto-lock after minutes': 'Automatisch sperren nach Minuten',
  'Both passwords must be filled in and match.': 'Beide Kennwörter müssen ausgefüllt und gleich sein.',
  'The browser cannot generate secure random values.': 'Der Browser kann keinen sicheren Zufallswert erzeugen.',
  'Configuration changed. Please set the password again.': 'Konfiguration geändert. Kennwort bitte erneut setzen.',
  'Could not set the password: ': 'Kennwort konnte nicht eingerichtet werden: ',
  'Automatic selection unavailable: ': 'Automatische Auswahl nicht verfügbar: ',
  'Entity registry unavailable.': 'Entitätenverzeichnis nicht verfügbar.',
  'Language': 'Sprache',
  'Automatic (Home Assistant)': 'Automatisch (Home Assistant)',
  'German': 'Deutsch',
  'English': 'Englisch',
};

/**
 * @typedef {Pick<import('./types.js').Hass, 'locale' | 'language'>} LocaleSource
 * @typedef {{ language?: string } | undefined} LanguageConfig
 */

/** @type {Record<string, string>} */
const NUMBER_FORMATS = {
  comma_decimal: 'en-US',
  decimal_comma: 'de-DE',
  quote_decimal: 'de-CH',
  space_comma: 'fr-FR',
  none: 'en-US',
};

/**
 * Language that the config or the user profile requests.
 *
 * @param {LanguageConfig} config Card config with the option `language`.
 * @param {LocaleSource | undefined} hass The `hass` object, for the language of the user profile.
 * @returns {string} The language, for example `de-CH`.
 */
function requestedLanguage(config, hass) {
  if (config?.language && config.language !== 'auto') return config.language;
  return hass?.locale?.language || hass?.language || 'en';
}

/**
 * Language of the card texts, German or English.
 *
 * @param {LanguageConfig} config Card config with the option `language`.
 * @param {LocaleSource | undefined} hass The `hass` object, for the language of the user profile.
 * @returns {'de' | 'en'} `de` for every German locale, otherwise `en`.
 */
export function languageCode(config, hass) {
  return String(requestedLanguage(config, hass)).toLowerCase().replaceAll('_', '-').split('-')[0] === 'de'
    ? 'de'
    : 'en';
}

/**
 * Translates an English source text and fills in the placeholders.
 *
 * @param {string} language `de` or `en`.
 * @param {string} text English source text, placeholders as `{name}`.
 * @param {Record<string, unknown>} [params] Values of the placeholders, unknown placeholders stay.
 * @returns {string} The text.
 */
export function translate(language, text, params = {}) {
  const message = language === 'de' ? DE[text] ?? text : text;
  return message.replace(/\{(\w+)\}/g, (match, key) => Object.hasOwn(params, key) ? String(params[key]) : match);
}

/**
 * Formats a number in the number format of the user profile.
 *
 * @param {number} value The number.
 * @param {LanguageConfig} [config] Card config with the option `language`.
 * @param {LocaleSource} [hass] The `hass` object, for the number format and the language of the user profile.
 * @param {Intl.NumberFormatOptions} [options] Format options, at most 1 decimal by default.
 * @returns {string} The formatted number.
 */
export function formatNumber(value, config, hass, options = {}) {
  const preference = hass?.locale?.number_format;
  const requested = requestedLanguage(config, hass);
  const locale = NUMBER_FORMATS[String(preference)]
    || (preference === 'system' ? globalThis.navigator?.language : requested) || 'en';
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 1,
      ...options,
      ...(preference === 'none' ? { useGrouping: false } : {}),
    }).format(value);
  } catch {
    return new Intl.NumberFormat('en', { maximumFractionDigits: 1, ...options }).format(value);
  }
}

/**
 * Text of an error of Home Assistant or the browser, it is data and never goes through `translate()`.
 *
 * @param {unknown} error The error.
 * @returns {string} Its message, or the value itself.
 */
export function errorText(error) {
  return /** @type {{ message?: string } | null | undefined} */ (error)?.message || String(error);
}
