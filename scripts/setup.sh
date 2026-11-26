#!/usr/bin/env bash

set -e

cd "$(dirname "$0")/.."

npm ci
# Browser of the end-to-end tests.
npx playwright install chromium
