# Contributing

## Guidelines

Contributing to this project should be as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

## Getting started

The project needs [Node.js](https://nodejs.org) (see `engines` in `package.json`).

1. Set up the project with `./scripts/setup.sh`. This installs the dependencies and the [prek](https://prek.j178.dev)
   hooks.
2. Change the sources in `src/` and build the card with `npm run build`. This creates `keba-keenergy-heizkurve.js`.
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
4. Update [README.md](README.md) and [README.en.md](README.en.md) if you changed something user-visible and add
   an entry under `## Unveröffentlicht` in [CHANGELOG.md](CHANGELOG.md).
5. Make sure `./scripts/lint.sh` and `npm test` pass.
6. Push the branch and open the pull request against `main`: `gh pr create --base main --fill`.
   - Write `Closes #12` in the description, the issue closes when the pull request is merged.
7. `@marcofeurer` is requested as reviewer automatically (`.github/CODEOWNERS`). The pull request needs his approval.
8. Only `@marcofeurer` merges, with a merge commit. The branch is deleted automatically.

Branch names are lowercase: `<issue>-<short-description>` or `<short-description>`, releases `release/vX.Y.Z`.

Never use real credentials, serial numbers or IP addresses of your heat pump in code, tests or issues.

## Coding style

`./scripts/lint.sh` runs all [prek](https://prek.j178.dev) hooks: [eslint](https://eslint.org) (lint and format),
the tests, yamllint, [rumdl](https://github.com/rvben/rumdl) and
[editorconfig-checker](https://editorconfig-checker.github.io). Fix and format the JavaScript files with
`npx eslint --fix .`. See [CLAUDE.md](CLAUDE.md) for the project rules.

## AI assistant

The project only uses [Claude Code](https://claude.com/claude-code) as AI assistant. Its rules are in
[CLAUDE.md](CLAUDE.md), [tests/CLAUDE.md](tests/CLAUDE.md) and the skills in `.claude/skills/`.

## Documentation

The documentation is in [README.md](README.md) (German) and [README.en.md](README.en.md) (English). Card examples
are in [karte.yaml](karte.yaml), [dashboard.yaml](dashboard.yaml) and `beispiele/`, screenshots in `vorschau.png`
and `preview-english.png`.

## Tests

The tests in `tests/` run with Node.js, without a browser.

```bash
npm test
```

## Releases

Only maintainers create releases. Releases and pre-releases are tagged on `main`.

1. Create the branch `release/vX.Y.Z` (or `release/vX.Y.Z-beta.N`) from `main`.
2. Set the version, update `CHANGELOG.md` and build the card.
3. Open the pull request against `main`, `@marcofeurer` reviews and merges it.
4. Create the GitHub release with the tag `vX.Y.Z` on `main` and attach `keba-keenergy-heizkurve.js`.
   Mark `vX.Y.Z-beta.N` as pre-release.

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
