# Contributing

## Guidelines

Contributing to this project should be as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

## Getting started

The project needs [Node.js](https://nodejs.org) (see `engines` in `package.json`).

1. Set up the project with `./scripts/setup.sh`. This installs the dependencies, the git hooks of
   [prek](https://prek.j178.dev) and `scripts/pre-push.sh` and Chromium for the end-to-end tests.
   - Windows: use Git Bash for the scripts, or `npm ci` and `npx playwright install chromium` in any terminal.
2. Change the sources in `src/` and build the card with `npm run build`. This creates
   `dist/keba_keenergy_heating_curve_card.js`.
3. Copy this file to the `www/` folder of your Home Assistant configuration and add it as a dashboard resource
   (see [README.md](README.md)).

## Workflow

Every change goes through a pull request against `main`. Direct pushes to `main` are blocked.

1. Open an issue first for features and larger changes. Small fixes can go straight to a pull request.
2. Create a branch from the current `main`:
   - with an issue (maintainers): `gh issue develop 12 --base main --checkout`, the branch is linked to the issue
   - with an issue (forks): `git switch -c 12-fix-tooltip-on-mobile main`
   - without an issue: `git switch -c fix-typo-in-readme main`
3. Commit with the issue number first, if there is one: `#12 Fix tooltip on mobile`.
4. Update [README.md](README.md) and [README.de.md](README.de.md) if you changed something user-visible and add
   an entry under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md).
5. Make sure `./scripts/lint.sh` and `npm test` pass.
6. Push the branch and open the pull request against `main`: `gh pr create --base main --fill`.
   - Write `Closes #12` in the description, the issue closes when the pull request is merged.
7. `@marcofeurer` is requested as reviewer automatically (`.github/CODEOWNERS`). The pull request needs his approval.
8. Only `@marcofeurer` merges, with a merge commit. The branch is deleted automatically.

Branch names are lowercase: `<issue>-<short-description>` or `<short-description>`, releases `release/vX.Y.Z`.

Never use real credentials, serial numbers or IP addresses of your heat pump in code, tests or issues.

## Coding style

`./scripts/lint.sh` runs all [prek](https://prek.j178.dev) hooks: [eslint](https://eslint.org) (lint and format),
the TypeScript check, the tests, yamllint, [rumdl](https://github.com/rvben/rumdl) and
[editorconfig-checker](https://editorconfig-checker.github.io). Fix and format the JavaScript and TypeScript files with
`npx eslint --fix .`. See [CLAUDE.md](CLAUDE.md) for the project rules.

## AI assistant

The project only uses [Claude Code](https://claude.com/claude-code) as AI assistant. Its rules are in
[CLAUDE.md](CLAUDE.md), [test/CLAUDE.md](test/CLAUDE.md) and the skills in `.claude/skills/`.

## Documentation

The documentation is in [README.md](README.md) (English) and [README.de.md](README.de.md) (German). Card examples
are in [card.yaml](card.yaml), [dashboard.yaml](dashboard.yaml) and `examples/`, screenshots in `assets/`.

## Tests

The tests in `test/` are written in TypeScript and use [vitest](https://vitest.dev), like the
[Home Assistant frontend](https://github.com/home-assistant/frontend). **100% test coverage is enforced**, so every
new code path needs a test.

- Unit tests in `test/unit/` with [jsdom](https://github.com/jsdom/jsdom) as browser, against `src/`
- Smoke tests in `test/dist/` against the built `dist/keba_keenergy_heating_curve_card.js`
- End-to-end tests in `test/e2e/` in a real Chromium with [Playwright](https://playwright.dev): layout, focus,
  keyboard and the password check of the browser

```bash
npm test                # unit tests
npm run test:coverage   # unit tests and coverage, fails below 100%
npm run test:dist       # build the card and run the smoke tests of the bundle
npm run test:e2e        # end-to-end tests in Chromium
npm run typecheck       # TypeScript types of the tests
```

The coverage report is in `test/coverage/index.html`. The CI uploads the coverage to
[Codecov](https://codecov.io/gh/superbox-dev/keba_keenergy_heating_curve_card), which comments on pull requests.

## Releases

Only maintainers create releases. Tags cannot be deleted, so a release must be correct before the tag is pushed.

1. Create the branch `release/vX.Y.Z` (or `release/vX.Y.Z-beta.N`) from `main`.
2. Set the version in `package.json` and `package-lock.json` with `npm version X.Y.Z --no-git-tag-version`.
   Use `X.Y.Z` for a stable release or `X.Y.Z-beta.N` for a pre-release (npm only accepts SemVer).
3. Rename `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) to `## [X.Y.Z] - YYYY-MM-DD`, add a new empty
   `## [Unreleased]` section above it and update the links at the bottom. Pre-releases don't need a changelog section.
4. Open the pull request against `main`, `@marcofeurer` reviews and merges it.
5. Run `./scripts/release.sh vX.Y.Z` (or `vX.Y.Z-beta.N`) on the updated `main`.

`./scripts/release.sh` creates and pushes the tag only if `./scripts/check-release.sh` passes. The check verifies that
the tag, `package.json` and `package-lock.json` have the same version and that stable releases have a changelog entry.
The release workflow runs the same check, builds the card and attaches `keba_keenergy_heating_curve_card.js` to the
GitHub release. It deletes older pre-releases.

Don't create tags manually and don't use `git push --no-verify` for tags.

## Report bugs

Report a bug by [opening a new issue](https://github.com/superbox-dev/keba_keenergy_heating_curve_card/issues/new/choose).
Great bug reports tend to have:

- A quick summary and/or background
- Steps to reproduce (the card configuration as YAML if you can)
- What you expected would happen
- What actually happens
- The versions of the card, Home Assistant and the `keba_keenergy` integration
- Errors from the browser console
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License][license].

[license]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/blob/main/LICENSE
