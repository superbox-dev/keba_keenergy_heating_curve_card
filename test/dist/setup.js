import { afterEach } from 'vitest';
import { defineHaForm } from '../fixtures/ha-form';

// The forms of Home Assistant, the editor of the card uses them.
defineHaForm();

afterEach(() => {
  document.body.replaceChildren();
});
