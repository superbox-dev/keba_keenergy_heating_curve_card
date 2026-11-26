// @ts-check
// The card in a real Chromium: layout, focus, keyboard and the PBKDF2 of the browser, which jsdom can't test.
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/card';
import { createHass, withStates } from '../fixtures/hass';
import { PASSWORD, PASSWORD_HASH } from '../fixtures/password';
import { entityId, temperature } from '../fixtures/registry';
import { CardView } from '../test_helper/card-view';
import { EditorView } from '../test_helper/editor-view';
import { settle } from '../test_helper/shadow-view';
/** @import { CardConfig } from '../fixtures/types' */

/**
 * Creates the card in a container of the given width, like a dashboard column.
 *
 * @param {number} width
 * @param {CardConfig} config
 * @returns {Promise<CardView>}
 */
async function cardWithWidth(width, config = {}, hass = createHass()) {
  const column = document.createElement('div');
  column.style.width = `${width}px`;
  document.body.append(column);
  const view = await CardView.create(config, hass);
  column.append(view.element);
  await settle();
  return view;
}

/**
 * @param {CardView} view
 * @returns {number}
 */
const columns = view =>
  getComputedStyle(view.get('.layout')).gridTemplateColumns.split(' ').length;

describe('layout', () => {
  it('renders the card and the chart with a size', async () => {
    const errors = vi.spyOn(console, 'error');

    const view = await cardWithWidth(1000);

    expect(view.element.getBoundingClientRect().height).toBeGreaterThan(300);
    expect(view.chart.svg.getBoundingClientRect().width).toBeGreaterThan(400);
    expect(view.chart.points[0].getBoundingClientRect().width).toBeGreaterThan(0);
    expect(errors).not.toHaveBeenCalled();
  });

  it('shows the chart next to the settings in a wide card', async () => {
    const view = await cardWithWidth(1000);

    expect(columns(view)).toBe(2);
  });

  it('shows the chart above the settings in a narrow card', async () => {
    const view = await cardWithWidth(400);

    expect(columns(view)).toBe(1);
  });
});

describe('editing', () => {
  it('keeps the focus in a point field while the readings update', async () => {
    const hass = createHass();
    const view = await cardWithWidth(1000, {}, hass);
    const field = view.pointInput(0, 'flow');

    await userEvent.fill(field, '44');
    view.hass = withStates(hass, { [entityId('111', 1, 'outdoor')]: temperature(-3) });

    expect(view.root.activeElement).toBe(field);
    expect(view.pointInput(0, 'flow').value).toBe('44');
    expect(view.message).toBe('Points changed · not saved yet');
  });
});

describe('password', () => {
  it('unlocks with the PBKDF2 of the browser', async () => {
    const view = await cardWithWidth(1000, { edit_password_hash: PASSWORD_HASH });
    await userEvent.click(view.unlockButton);

    await userEvent.fill(view.get('#edit-password'), PASSWORD);
    await userEvent.keyboard('{Enter}');
    await view.waitForPasswordCheck();

    expect(view.lockStatus).toBe('Editing unlocked');
  });

  it('closes the unlock form with the Escape key', async () => {
    const view = await cardWithWidth(1000, { edit_password_hash: PASSWORD_HASH });
    await userEvent.click(view.unlockButton);

    await userEvent.keyboard('{Escape}');

    expect(view.unlockForm).toBeNull();
  });

  it('accepts a password of the editor', async () => {
    const editor = await EditorView.create({});
    const configs = editor.collectConfigs();
    await editor.setPassword('editor-password');
    const view = await cardWithWidth(1000, configs[0]);

    await view.unlock('editor-password');

    expect(view.lockStatus).toBe('Editing unlocked');
  });
});
