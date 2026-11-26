import { describe, expect, it, vi } from 'vitest';

const CARD = 'keba-keenergy-heating-curve-card';

/** Loads `src/card.js` again, like a second resource in the dashboard. */
async function loadCard(): Promise<void> {
  vi.resetModules();
  await import('../../../src/card');
}

describe('registration', () => {
  it('defines the card and the editor and adds the card to the card picker', async () => {
    await import('../../../src/card');

    expect(customElements.get(CARD)).toBeDefined();
    expect(customElements.get(`${CARD}-editor`)).toBeDefined();
    expect(window.customCards).toEqual([{
      type: CARD,
      name: 'KEBA KeEnergy Heating Curve Card',
      description: 'Heating curves and limits with automatic discovery · Deutsch / English',
      preview: false,
    }]);
  });

  it('does not register twice when the file is loaded again', async () => {
    const card = customElements.get(CARD);
    const define = vi.spyOn(customElements, 'define');

    await loadCard();

    expect(define).not.toHaveBeenCalled();
    expect(customElements.get(CARD)).toBe(card);
    expect(window.customCards).toHaveLength(1);
  });

  it('keeps the cards of other plugins', async () => {
    window.customCards = [{ type: 'other-card' }];

    await loadCard();

    expect(window.customCards.map(customCard => customCard.type)).toEqual(['other-card', CARD]);
  });
});
