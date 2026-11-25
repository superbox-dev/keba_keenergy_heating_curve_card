# Contributing

## Workflow

Every change goes through a pull request against `main`. Direct pushes to `main` are blocked.

1. Open an issue first for features and larger changes. Small fixes can go straight to a pull request.
2. Create a branch from the current `main`:
   - with an issue (maintainers): `gh issue develop 12 --base main --checkout`, the branch is linked to the issue
   - with an issue (forks): `git switch -c 12-fix-tooltip-on-mobile main`
   - without an issue: `git switch -c fix-typo-in-readme main`
3. Commit with the issue number first, if there is one: `#12 Fix tooltip on mobile`.
4. Run `npm test` and `npm run build`.
5. Push the branch and open the pull request against `main`: `gh pr create --base main --fill`.
   - Write `Closes #12` in the description, the issue closes when the pull request is merged.
6. `@marcofeurer` is requested as reviewer automatically (`.github/CODEOWNERS`). The pull request needs his approval.
7. Only `@marcofeurer` merges, with a merge commit. The branch is deleted automatically.

Branch names are lowercase: `<issue>-<short-description>` or `<short-description>`, releases `release/vX.Y.Z`.

Never use real credentials, serial numbers or IP addresses of your heat pump in code, tests or issues.

## Releases

Only maintainers create releases. Releases and pre-releases are tagged on `main`.

1. Create the branch `release/vX.Y.Z` (or `release/vX.Y.Z-beta.N`) from `main`.
2. Set the version, update `CHANGELOG.md` and build the card.
3. Open the pull request against `main`, `@marcofeurer` reviews and merges it.
4. Create the GitHub release with the tag `vX.Y.Z` on `main` and attach `keba-keenergy-heizkurve.js`.
   Mark `vX.Y.Z-beta.N` as pre-release.
