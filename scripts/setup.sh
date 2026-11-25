#!/usr/bin/env bash

set -e

cd "$(dirname "$0")/.."

npm ci
ln -sf ../../scripts/pre-push.sh .git/hooks/pre-push
