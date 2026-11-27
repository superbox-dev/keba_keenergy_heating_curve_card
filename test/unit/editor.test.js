import { describe, expect, it, vi } from 'vitest';
import '../../src/card';
import { createCard } from '../test_helper/card-view';
import { createEditor, EditorView } from '../test_helper/editor-view';
import { createHass, withLanguage } from '../fixtures/hass';
import { controllerEntities, devices } from '../fixtures/registry';
import { settle } from '../test_helper/shadow-view';
/** @import { CallWS, FakeHass } from '../fixtures/types' */

/**
 * Two controllers, `111` with two heating circuits and `222` with one.
 *
 * @returns {FakeHass}
 */
const twoControllers = () => createHass({
  registry: [...controllerEntities('entry-1', '111', 2), ...controllerEntities('entry-2', '222')],
  deviceList: [...devices('111', 2), ...devices('222')],
});

const AUTOMATIC = { value: 'auto', label: 'Automatic · selectable in the dashboard', selected: false };

describe('fields', () => {
  it('renders nothing without config', () => {
    const editor = new EditorView(createEditor());

    editor.hass = createHass();

    expect(editor.root.innerHTML).toBe('');
  });

  it('shows the config', async () => {
    const editor = await EditorView.create({ title: 'Basement', language: 'de', flow_min: '20,5', x_min: -10 });

    expect(editor.value('title')).toBe('Basement');
    expect(editor.value('language')).toBe('de');
    expect(editor.value('flow_min')).toBe(20.5);
    expect(editor.value('x_min')).toBe(-10);
    expect(editor.value('x_max')).toBeUndefined();
    expect(editor.summary).toBe('Diagrammachsen');
  });

  it('labels the fields and sections in the language of the card', async () => {
    const editor = await EditorView.create({ language: 'de' });

    expect(editor.label('title')).toBe('Titel');
    expect(editor.label('x_step')).toBe('Rasterweite (°C)');
    expect(editor.sectionTitles).toEqual(['X-Achse · Außentemperatur', 'Y-Achse · Vorlauftemperatur', 'Zwischenwerte']);
    expect(editor.sectionLabels).toEqual(['', '', '', '', '', '']);
  });

  it('shows texts of Home Assistant as text', async () => {
    const hass = createHass();
    hass.callWS.mockRejectedValue(Error('<b>denied</b>'));

    const editor = await EditorView.create({}, hass);

    expect(editor.content).toContain('<b>denied</b>');
    expect(editor.query('b')).toBeNull();
  });

  it('shows the chart axis limits', async () => {
    const editor = await EditorView.create({});

    expect(editor.bounds('y_step')).toEqual({ min: 0.01, max: 150, step: 0.01, mode: 'box' });
    expect(editor.bounds('intermediate_step')?.max).toBe(200);
  });

  it('keeps its sections and forms when it is drawn again', async () => {
    const editor = await EditorView.create({});
    const axes = editor.chartAxes, form = editor.form('title');

    await editor.selectLanguage('de');

    expect(editor.chartAxes).toBe(axes);
    expect(editor.form('title')).toBe(form);
  });

  it('shows the language of Home Assistant', async () => {
    const editor = await EditorView.create({}, createHass({ language: 'de' }));

    expect(editor.languageOptions[0]).toEqual({ value: 'auto', label: 'Automatisch (Home Assistant)', selected: true });
  });

  it('redraws when the language of Home Assistant changes', async () => {
    const hass = createHass();
    const editor = await EditorView.create({}, hass);

    editor.hass = withLanguage(hass, 'de');

    expect(editor.summary).toBe('Diagrammachsen');
    expect(editor.label('title')).toBe('Titel');
  });

  it('gives the forms the hass object', async () => {
    const hass = createHass();

    const editor = await EditorView.create({}, hass);

    expect(editor.form('title').hass).toBe(hass);
  });

  it('keeps the schemas when only the states change', async () => {
    const hass = createHass();
    const editor = await EditorView.create({}, hass);
    const schema = editor.form('title').schema;
    const update = { ...hass };

    editor.hass = update;

    expect(editor.form('title').schema).toBe(schema);
    expect(editor.form('title').hass).toBe(update);
  });
});

describe('controllers', () => {
  it('offers the controllers and the heating circuits', async () => {
    const editor = await EditorView.create({ config_entry: 'entry-1', circuit: '2' }, twoControllers());

    expect(editor.controllerOptions).toEqual([
      AUTOMATIC,
      { value: 'entry-1', label: 'KeEnergy controller · 111', selected: true },
      { value: 'entry-2', label: 'KeEnergy controller · 222', selected: false },
    ]);
    expect(editor.circuitOptions).toEqual([
      AUTOMATIC,
      { value: '1', label: 'Heating circuit 1 · Circuit device 1', selected: false },
      { value: '2', label: 'Heating circuit 2 · Circuit device 2', selected: true },
    ]);
  });

  it('selects the controller of the serial number', async () => {
    const editor = await EditorView.create({ serial: 222 }, twoControllers());

    expect(editor.value('config_entry')).toBe('entry-2');
  });

  it('keeps an unknown heating circuit', async () => {
    const editor = await EditorView.create({ circuit: '5' }, twoControllers());

    expect(editor.circuitOptions.at(-1)).toEqual({ value: '5', label: 'Heating circuit 5', selected: true });
  });

  it('pins a controller', async () => {
    const editor = await EditorView.create({ serial: '111', circuit: '2' }, twoControllers());
    const configs = editor.collectConfigs();

    await editor.selectController('entry-2');

    expect(configs).toEqual([{ config_entry: 'entry-2' }]);
    expect(editor.circuitOptions).toHaveLength(2);
  });

  it('pins a heating circuit', async () => {
    const editor = await EditorView.create({ config_entry: 'entry-1' }, twoControllers());
    const configs = editor.collectConfigs();

    await editor.selectCircuit('2');

    expect(configs).toEqual([{ config_entry: 'entry-1', circuit: '2' }]);
  });

  it.each([
    { name: 'controller', config: { config_entry: 'entry-1' }, select: 'selectController' },
    { name: 'heating circuit', config: { circuit: '2' }, select: 'selectCircuit' },
  ])('removes the pinning of the $name', async ({ config, select }) => {
    const editor = await EditorView.create(config, twoControllers());
    const configs = editor.collectConfigs();

    await editor[/** @type {'selectController' | 'selectCircuit'} */ (select)]('auto');

    expect(configs).toEqual([{}]);
  });

  it('loads the registry once', async () => {
    const hass = twoControllers();
    const editor = await EditorView.create({}, hass);

    editor.hass = { ...hass };
    await settle();

    expect(hass.callWS).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['a forbidden registry', Error('Unauthorized'), 'Unauthorized'],
    ['registry errors without message', 'denied', 'denied'],
  ])('explains %s', async (_, failure, error) => {
    const hass = createHass();
    hass.callWS.mockRejectedValue(failure);

    const editor = await EditorView.create({}, hass);

    expect(editor.content).toContain(`Automatic selection unavailable: ${error}`);
  });

  it('keeps the forms when the registry arrives', async () => {
    /** @type {(() => void)[]} */
    const pending = [];
    const hass = twoControllers();
    const answer = /** @type {CallWS} */ (hass.callWS.getMockImplementation());
    hass.callWS.mockImplementation(message => new Promise((resolve) => {
      pending.push(() => resolve(answer(message)));
    }));
    const editor = await EditorView.create({}, hass);
    const form = editor.form('config_entry');

    pending.forEach(finish => finish());
    await settle();

    expect(editor.form('config_entry')).toBe(form);
    expect(editor.controllerOptions).toHaveLength(3);
  });

  it('explains an invalid registry', async () => {
    const editor = await EditorView.create({ language: 'de' }, createHass({ registry: null }));

    expect(editor.content).toContain('Entitätenverzeichnis nicht verfügbar.');
  });
});

describe('changes', () => {
  it('sends text fields', async () => {
    const editor = await EditorView.create({ title: 'Old' });
    const configs = editor.collectConfigs();

    await editor.setField('title', 'New');
    await editor.setField('title', '');

    expect(configs).toEqual([{ title: 'New' }, {}]);
  });

  it('sends number fields and removes empty ones', async () => {
    const editor = await EditorView.create({});
    const configs = editor.collectConfigs();

    await editor.setField('flow_max', 55.5);
    await editor.setField('x_step', 2.5);
    await editor.setField('x_step', undefined);

    expect(configs).toEqual([{ flow_max: 55.5 }, { flow_max: 55.5, x_step: 2.5 }, { flow_max: 55.5 }]);
  });

  it('ignores invalid chart axis values', async () => {
    const editor = await EditorView.create({});
    const configs = editor.collectConfigs();

    await editor.setField('x_min', -200);

    expect(configs).toEqual([]);
    expect(editor.value('x_min')).toBeUndefined();
  });

  it('ignores a form event without a change', async () => {
    const editor = await EditorView.create({ title: 'Same' });
    const configs = editor.collectConfigs();

    await editor.setField('title', 'Same');

    expect(configs).toEqual([]);
  });

  it('sends the language and redraws', async () => {
    const editor = await EditorView.create({});
    const configs = editor.collectConfigs();

    await editor.selectLanguage('de');

    expect(configs).toEqual([{ language: 'de' }]);
    expect(editor.summary).toBe('Diagrammachsen');
  });
});

describe('password', () => {
  it('sets a password', async () => {
    const editor = await EditorView.create({});
    const configs = editor.collectConfigs();

    await editor.setPassword('secret');

    expect(configs).toHaveLength(1);
    expect(configs[0].edit_password_hash).toMatch(/^pbkdf2-sha256\$120000\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
    expect(editor.passwordSummary).toBe('Password protection · configured');
    expect(editor.newPasswordInput.value).toBe('');
  });

  it('accepts its own password in the card', async () => {
    const editor = await EditorView.create({});
    const configs = editor.collectConfigs();

    await editor.setPassword('secret');

    const card = createCard();
    expect(() => card.setConfig(configs[0])).not.toThrow();
  });

  it.each([
    ['empty passwords', '', ''],
    ['different passwords', 'secret', 'other'],
  ])('rejects %s', async (_, password, repeated) => {
    const editor = await EditorView.create({});
    const configs = editor.collectConfigs();

    await editor.setPassword(password, repeated);

    expect(editor.text('#password-message')).toBe('Both passwords must be filled in and match.');
    expect(configs).toEqual([]);
  });

  it('needs secure random values', async () => {
    vi.stubGlobal('crypto', {});
    const editor = await EditorView.create({});

    await editor.setPassword('secret');
    vi.unstubAllGlobals();

    expect(editor.text('#password-message')).toBe('The browser cannot generate secure random values.');
  });

  it('asks again when the config changes while hashing', async () => {
    const editor = await EditorView.create({});
    const configs = editor.collectConfigs();
    const message = editor.passwordMessage;
    const button = editor.createPasswordButton;

    editor.startPassword('secret');
    editor.setConfig({ title: 'Changed' });
    await editor.waitForPassword(button);

    expect(message.textContent).toBe('Configuration changed. Please set the password again.');
    expect(configs).toEqual([]);
  });

  it('removes the password', async () => {
    const editor = await EditorView.create({ edit_password_hash: 'pbkdf2-sha256$...' });

    expect(editor.passwordSummary).toBe('Password protection · configured');

    const configs = editor.collectConfigs();
    editor.removePasswordButton?.click();

    expect(configs).toEqual([{}]);
    expect(editor.removePasswordButton).toBeNull();
    expect(editor.passwordSummary).toBe('Password protection · optional');
  });
});
