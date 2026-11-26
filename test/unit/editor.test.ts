import { describe, expect, it, vi } from 'vitest';
import '../../src/card';
import { EditorView } from '../test_helper/editor-view';
import { createHass, withLanguage } from '../fixtures/hass';
import { controllerEntities, devices } from '../fixtures/registry';
import { settle } from '../test_helper/shadow-view';
import type { FakeHass } from '../fixtures/types';

/** Two controllers, `111` with two heating circuits and `222` with one. */
const twoControllers = (): FakeHass => createHass({
  registry: [...controllerEntities('entry-1', '111', 2), ...controllerEntities('entry-2', '222')],
  deviceList: [...devices('111', 2), ...devices('222')],
});

const AUTOMATIC = { value: '', label: 'Automatic · selectable in the dashboard', selected: false };

describe('fields', () => {
  it('renders nothing without config', () => {
    const editor = new EditorView(document.createElement('keba-keenergy-heating-curve-card-editor'));

    editor.hass = createHass();

    expect(editor.root.innerHTML).toBe('');
  });

  it('shows the config', async () => {
    const editor = await EditorView.create({ title: 'Basement', language: 'de', flow_min: '20,5', x_min: -10 });

    expect(editor.field('title').value).toBe('Basement');
    expect(editor.languageSelect.value).toBe('de');
    expect(editor.field('flow_min').value).toBe('20.5');
    expect(editor.field('x_min').value).toBe('-10');
    expect(editor.field('x_max').value).toBe('');
    expect(editor.summary).toBe('Diagrammachsen');
  });

  it('escapes the values', async () => {
    const editor = await EditorView.create({ title: `"><b>A & 'B'</b>` });

    expect(editor.field('title').value).toBe(`"><b>A & 'B'</b>`);
    expect(editor.query('b')).toBeNull();
  });

  it('shows the chart axis limits', async () => {
    const editor = await EditorView.create({});

    const yStep = editor.field('y_step');
    expect([yStep.min, yStep.max, yStep.placeholder]).toEqual(['0.01', '150', '5']);
    expect(editor.field('intermediate_step').max).toBe('200');
  });

  it('keeps the chart axes open after a redraw', async () => {
    const editor = await EditorView.create({});
    editor.chartAxes.open = true;

    await editor.selectLanguage('de');

    expect(editor.chartAxes.open).toBe(true);
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
  });

  it('keeps a focused field when the language changes', async () => {
    const hass = createHass();
    const editor = await EditorView.create({}, hass);
    const title = editor.field('title');
    title.focus();

    editor.hass = withLanguage(hass, 'de');

    expect(editor.field('title')).toBe(title);
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

    expect(editor.controllerSelect.value).toBe('entry-2');
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

  it('removes the pinning', async () => {
    const editor = await EditorView.create({ config_entry: 'entry-1' }, twoControllers());
    const configs = editor.collectConfigs();

    await editor.selectController('');

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

  it('keeps a focused field when the registry arrives', async () => {
    const pending: (() => void)[] = [];
    const hass = twoControllers();
    const answer = hass.callWS.getMockImplementation()!;
    hass.callWS.mockImplementation(message => new Promise((resolve) => {
      pending.push(() => resolve(answer(message)));
    }));
    const editor = await EditorView.create({}, hass);
    const title = editor.field('title');
    title.focus();

    pending.forEach(finish => finish());
    await settle();

    expect(editor.field('title')).toBe(title);
    expect(editor.controllerOptions).toHaveLength(1);
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

  it('sends number fields as numbers', async () => {
    const editor = await EditorView.create({});
    const configs = editor.collectConfigs();

    await editor.setField('flow_max', '55.5');
    await editor.setField('x_step', '2.5');

    expect(configs).toEqual([{ flow_max: 55.5 }, { flow_max: 55.5, x_step: 2.5 }]);
  });

  it('ignores invalid chart axis values', async () => {
    const editor = await EditorView.create({});
    const configs = editor.collectConfigs();

    await editor.setField('x_min', '-200');

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

    const card = document.createElement('keba-keenergy-heating-curve-card');
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
