#!/usr/bin/env bash

set -e

cd "$(dirname "$0")/.."

tag="$1"

if [[ -z "$tag" && "$GITHUB_REF" == refs/tags/* ]]; then
  tag="$GITHUB_REF"
fi

tag="${tag#refs/tags/}"
tag="${tag#v}"

errors=0

fail() {
  echo "Error: $1" >&2
  errors=$((errors + 1))
}

# npm only accepts SemVer, so pre-releases are X.Y.Z-beta.N instead of X.Y.ZbN
is_release() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+)?$ ]]
}

is_stable() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

package_version="$(node -p "require('./package.json').version")"
lock_version="$(node -p "require('./package-lock.json').version")"

if [[ "$package_version" != "$lock_version" ]]; then
  fail "package.json ($package_version) does not match package-lock.json ($lock_version)"
fi

if ! is_release "$package_version"; then
  fail "Version '$package_version' is not a release (expected X.Y.Z or X.Y.Z-beta.N)"
fi

if [[ -n "$tag" ]]; then
  if ! is_release "$tag"; then
    fail "Tag 'v$tag' is not a release (expected vX.Y.Z or vX.Y.Z-beta.N)"
  elif [[ "$tag" != "$package_version" ]]; then
    fail "Tag ($tag) does not match package.json ($package_version)"
  fi
fi

if is_stable "$package_version" \
  && ! grep -Eq "^## \[${package_version//./\\.}\] - [0-9]{4}-[0-9]{2}-[0-9]{2}$" CHANGELOG.md; then
  fail "CHANGELOG.md has no entry for $package_version"
fi

if [[ "$errors" -gt 0 ]]; then
  exit 1
fi

echo "Release check passed: $package_version"
