---
name: release
description: Release or pre-release the card (version bump, changelog, tag). Use when asked to release, pre-release, tag or bump the version.
---

# Release

- Version from the changelog: breaking → major, new options or behavior → minor, else patch
- Pre-release `N` counts per target version, starting at `-beta.1`
- Ask before pushing or creating the release, show version, branch and tag

1. Branch `release/vX.Y.Z` (or `release/vX.Y.Z-beta.N`) from the current `main`
2. Set the version in `package.json`, `build.mjs`, `src/card.js`, `src/i18n.js` and the README files
   - **always** identical everywhere, also for pre-releases
3. `CHANGELOG.md`: release `vX.Y.Z` turns `## Unveröffentlicht` into `## X.Y.Z`, a new empty `## Unveröffentlicht`
   above it, pre-releases keep the entries under `## Unveröffentlicht`
4. `npm run build`, update `SHA256SUMS.txt`
5. Commit, push, pull request against `main` with `Closes #<issue>` if there is one, `@marcofeurer` merges
6. After the merge, on `main`: `gh release create vX.Y.Z keba-keenergy-heizkurve.js`, pre-releases with
   `--prerelease`
