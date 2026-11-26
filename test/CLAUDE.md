# Tests

- JavaScript with vitest and jsdom, like the Home Assistant frontend, config in `test/vitest.config.js`
  - strict JSDoc types (`@param`, `@returns`, `@type`, `@typedef`, `@import`), checked by `npm run typecheck`
    (`tsconfig.json`)
  - `// @ts-check` as first line of every file, no `any`, no other `@ts-` comments
  - casts as `/** @type {T} */ (value)`, generic helpers with `@template`
  - import without extension (`../src/discovery`)
- `test/unit/` mirrors `src/`: `<module>.test.js` per source module, the card split by topic in `test/unit/card/`
  - `describe` per feature, `it` with a sentence of the behavior, `it.each` for variants
  - Arrange, act, assert: separated by a blank line, the action alone in the middle block
- Fakes and test data in `test/fixtures/`, like the Home Assistant frontend, every export with a JSDoc comment
  - `types.js`: `@typedef`s of the card and of `hass`, entity states from `home-assistant-js-websocket` like
    Home Assistant
  - `registry.js`: registry entries and states with fake serial numbers (`circuitStates()`, `curveSensor()`, …)
  - `hass.js`: fake Home Assistant (`createHass()`, `withStates()`, `serviceCalls()`, `holdServiceCalls()`)
  - `password.js`: `PASSWORD` and `PASSWORD_HASH`
- Page objects in `test/test_helper/`: `card-view.js` (the card with its chart, `createCard()`), `editor-view.js`
  (the editor, `createEditor()`), `shadow-view.js` (their base and `settle()`)
- Test the card and the editor only through the page objects: `CardView.create()`, `EditorView.create()`
  - elements and texts by name (`view.savePointsButton`, `view.message`), actions as methods (`view.savePoints()`)
  - a new selector belongs in the page object, not in the test
  - never read or set `_`-prefixed members
  - assert the shown texts, the elements and the calls (`serviceCalls()`, `hass.callWS`)
- Objects instead of tuples (`{ value, label, selected }`), constants for repeated texts
- Three suites with their own config, all with the page objects:
  - unit tests in `test/unit/` (`vitest.config.js`): jsdom against `src/`, 100% coverage, everything that jsdom can test
  - smoke tests in `test/dist/` (`vitest.dist.config.js`): the built bundle loads, registers and renders, no details
  - end-to-end tests in `test/e2e/` (`vitest.e2e.config.js`): Chromium for what jsdom can't (layout, focus,
    keyboard, the real PBKDF2), only through `userEvent` of `vitest/browser`
  - every test file imports what it tests (`import '../../src/card'`), the page objects import nothing of `src/`
- `test/unit/setup.js` computes PBKDF2 with Web Crypto, the JavaScript version is too slow with coverage
  - a failing check with `vi.mock` of `@noble/hashes/pbkdf2.js` in its own file
- Time with `vi.useFakeTimers()`, never wait in real time
- Every bug fix gets a regression test that fails without the fix
- Every `_t()` text needs a `DE` entry with the same placeholders, `i18n.test.js` checks this
- Registry entries built in the test with fake serial numbers and entity IDs, never real data
- No network, tests are independent of each other
