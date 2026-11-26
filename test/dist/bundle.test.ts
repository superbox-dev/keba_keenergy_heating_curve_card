// Smoke tests of the built card: the file HACS downloads loads, registers and renders.
import { beforeAll, describe, expect, it, vi } from 'vitest';
import packageJson from '../../package.json';
import { controllerEntities, devices } from '../fixtures/registry';
import { createHass } from '../fixtures/hass';
import { PASSWORD_HASH } from '../fixtures/password';
import { CardView } from '../test_helper/card-view';
import { EditorView } from '../test_helper/editor-view';

/** The bundle from `npm run build`, or the file of a release in its place. */
const BUNDLE = '/dist/keba_keenergy_heating_curve_card.js';

beforeAll(async () => {
  await import(/* @vite-ignore */ BUNDLE);
});

describe('bundle', () => {
  it('registers the card, the editor and the card picker entry', () => {
    expect(customElements.get('keba-keenergy-heating-curve-card')).toBeDefined();
    expect(customElements.get('keba-keenergy-heating-curve-card-editor')).toBeDefined();
    expect(window.customCards?.map(card => card.type)).toEqual(['keba-keenergy-heating-curve-card']);
  });

  it('shows the version of package.json', async () => {
    const view = await CardView.create({}, createHass());

    expect(view.content).toContain(`General version ${packageJson.version}`);
  });

  it('renders the card without errors', async () => {
    const errors = vi.spyOn(console, 'error');

    const view = await CardView.create({}, createHass());

    expect(view.title).toBe('KeEnergy heating curve');
    expect(view.reading('outdoor')).toBe('5 °C');
    expect(view.chart.points).toHaveLength(3);
    expect(view.mappingError).toBeUndefined();
    expect(errors).not.toHaveBeenCalled();
  });

  it('unlocks with the bundled PBKDF2', async () => {
    const view = await CardView.create({ edit_password_hash: PASSWORD_HASH }, createHass());

    await view.unlock();

    expect(view.lockStatus).toBe('Editing unlocked');
  });

  it('renders the editor', async () => {
    const hass = createHass({ registry: controllerEntities('entry-1', '111'), deviceList: devices('111') });

    const editor = await EditorView.create({}, hass);

    expect(editor.controllerOptions.map(option => option.value)).toEqual(['', 'entry-1']);
  });
});
