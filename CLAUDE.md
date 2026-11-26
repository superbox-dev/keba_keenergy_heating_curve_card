# CLAUDE.md

Home Assistant Lovelace card (HACS plugin) to view and edit the heating curves of the `keba_keenergy` integration,
plain JavaScript web components bundled with esbuild into one file, only runtime dependency `@noble/hashes`.

## Commands

- Use `npm`, Node.js from `engines` in `package.json`
- Setup: `./scripts/setup.sh`

```bash
npx eslint --fix .   # format and fix (lint.sh only checks)
./scripts/lint.sh       # all prek hooks: eslint, tsc, all tests, yamllint, rumdl, file checks
npm test                # tests
npm run test:coverage   # tests and coverage
npm run test:dist       # build and smoke tests of dist/
npm run test:e2e        # tests in Chromium
npm run typecheck       # types of the sources (JSDoc) and the tests
npm run build           # build dist/keba_keenergy_heating_curve_card.js from src/
```

Before finishing a change, run `eslint --fix`, `lint.sh` and `npm run test:coverage`, in this order.

## Rules

- **No breaking changes** for installations: nothing a user notices later and has to fix by hand
  (element names `keba-keenergy-heating-curve-card` / `-editor`, the file name `keba_keenergy_heating_curve_card.js`,
  config options and their defaults, `entities` keys, the `edit_password_hash` format)
  - only when asked, then as a major release
  - exception: the English renaming of #1 in v1.x, with upgrade steps in both README files
- `dist/` is a build output, never commit it, the release workflow builds and attaches the card
- Every interpolated value in an HTML template goes through `esc()`
  - the `html` tag of `src/html.js` removes line breaks with their indentation, break lines only between elements
- Writes only from explicit user actions (save buttons, curve table selection, enabling entities), switching the
  view never writes
  - only through Home Assistant: `keba_keenergy.set_heating_curve_points`, `select.select_option`,
    `number.set_value`, `config/entity_registry/update`
- Temperatures internally in °C, converted from and to the unit of the entity only when reading and writing
- Texts: English source text in `_t()`, German in `DE` of `src/i18n.js`, placeholders as `{name}`
  - never pass data through `_t()` (entity IDs, table names, device names, user labels, error texts of
    Home Assistant)
- Password: only the salted PBKDF2-SHA256 verifier in the card config, never the password or the unlock state in
  browser storage, wipe password bytes after use
- No external scripts or downloads at runtime, everything is bundled
- No new dependencies (also dev dependencies) without asking first
- No inline lint suppressions (`eslint-disable`), no new ones in the config, fix the code
- Comments as complete sentences with a trailing period
- JSDoc for the functions, methods and exported constants of `src/`, `npm run typecheck` checks the types
- Every file follows `.editorconfig`, whether a linter checks it or not
- Style rules apply to new and changed code, existing code only adapted when asked
- No real credentials, serial numbers or IP addresses, also not in examples or screenshots
- Missing entities or actions belong in `keba_keenergy`, stop and ask how to proceed
- `git add` new files, the pre-commit hooks only check tracked files
- 100% coverage (lines, branches, functions, statements), never lower the thresholds in `test/vitest.config.js` or
  exclude code, test the code or remove unreachable code
- **Never edit `CLAUDE.md` files or `.claude/skills/` on your own**, only when asked
  - if a change conflicts with them, stop and ask

## Architecture

- `src/card.js`: the card element (state, rendering, events), its parts by topic in `src/card/`:
  - `config.js` (options and defaults), `binding.js` (controller and heating circuit), `entities.js` (states and
    units), `points.js` (curve points), `chart.js` (SVG chart), `lock.js` (password lock), `templates.js` and
    `styles.js` (HTML and CSS)
  - `actions.js`: every write to Home Assistant
- `src/password.js`: PBKDF2 verifiers of the card and the editor, `src/html.js`: `esc()` and `html`,
  `src/types.js`: JSDoc types of Home Assistant
- `src/editor.js`: the visual card editor, `src/discovery.js`: controllers and heating
  circuits from the entity registry, `src/i18n.js`: translations and number format, `src/chart-axis.js`: chart axes
- `build.mjs` bundles `src/card.js` as IIFE and sets `__VERSION__` from `package.json`, never hardcode the version
- Discovery only matches registry `unique_id`s and config entries, never entity IDs or names (users rename them)
  - legacy `unique_id` variants of the integration are aliases in `parseEntity()`
- Rendering keeps focused inputs and open selects: a full redraw only when the view changes, otherwise
  `_refreshLive()` / `_patchPoints()`

## Domain

- One config entry is one controller, the first found is the initial view
- Heating circuit entities: `<serial>_heat_circuit_<field>` (circuit 1) or with the circuit number, the outdoor
  temperature belongs to the controller
- Curve tables (`HC1`, `HC2`, ...) are not heating circuit numbers, several circuits of a controller can share one
  - selecting a table assigns it to the shown circuit, saving points changes it for all circuits that use it
- Points: 1 to 16, outdoor −40 to 40 °C, flow 10 to 90 °C, outdoor temperatures unique after rounding to 2 decimals
- `flow_min` / `flow_max`, the axis options and `intermediate_step` only change the chart, never the controller
- The card never changes the curve type (point table / hybrid), slope or offset

## Documentation

- `README.md` (English) and `README.de.md` (German) are the only documentation, update both when options, behavior
  or requirements change
  - same sections in the same order, UI labels as the card shows them in the language
  - short sentences, prefer lists
- Card examples in `card.yaml`, `dashboard.yaml` and `examples/`, keep them working
- Images in `assets/`, only with example data

## Changelog, versions and git

- Every change users notice gets an entry under `## [Unreleased]` in `CHANGELOG.md` (not refactorings, tests, CI,
  `CLAUDE.md` or skills), use the `changelog` skill
- Tickets: create and update them with the `issue` skill
- Version: only change it when asked, use the `release` skill
- One branch per change from `main`, pull request against `main` with `Closes #<issue>`, never push to `main`
  - a pull request based on another open pull request stays a draft until its base is merged
- Only commit or push when asked
- Commit message of a change for an issue starts with its number (`#67 Fix sensors that are not in use`)
