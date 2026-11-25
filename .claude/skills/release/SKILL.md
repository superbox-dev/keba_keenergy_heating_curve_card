---
name: release
description: Release or pre-release the card (version bump, changelog, tag). Use when asked to release, pre-release, tag or bump the version.
---

# Release

- Version from the changelog: breaking (incl. `Removed`) → major, `Added`/`Changed`/`Deprecated` → minor, else
  patch
  - exception: the English renaming of #1 stays in v1.x
- Pre-release `N` counts per target version, starting at `-beta.1`
  - npm only accepts SemVer, so pre-releases are `X.Y.Z-beta.N`, not `X.Y.ZbN` like the Python projects
- `v*` tags create the GitHub release, the workflow builds `keba_keenergy_heating_curve_card.js` and attaches it
- Ask before pushing, show version, branch and tag

1. Branch `release/vX.Y.Z` (or `release/vX.Y.Z-beta.N`) from the current `main`
2. `npm version X.Y.Z --no-git-tag-version` (or `X.Y.Z-beta.N`)
   - **always** identical in `package.json`, `package-lock.json` and the tag (without `v`), also for pre-releases
3. `CHANGELOG.md`, use the `changelog` skill:
   - pre-release `vX.Y.Z-beta.N`: entries stay under `## [Unreleased]`
   - release `vX.Y.Z`: `## [Unreleased]` becomes `## [X.Y.Z] - YYYY-MM-DD`, a new empty `## [Unreleased]` above it,
     update the links at the bottom
4. Commit, push, pull request against `main` with `Closes #<issue>` if there is one, `@marcofeurer` merges
5. After the merge: `./scripts/release.sh vX.Y.Z` (or `vX.Y.Z-beta.N`) on the updated `main`
