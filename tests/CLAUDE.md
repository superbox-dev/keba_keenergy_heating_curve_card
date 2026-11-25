# Tests

- Plain Node.js scripts with `node:assert/strict`, one `<module>.mjs` per source module, imported by `run.mjs`
- Every bug fix gets a regression test that fails without the fix
- Every `_t()` text needs an `EN` entry with the same placeholders, `i18n.mjs` checks this
- Registry entries built in the test with fake serial numbers and entity IDs, never real data
- No network, tests are independent of each other
