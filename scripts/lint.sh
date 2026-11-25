#!/usr/bin/env bash

set -e

cd "$(dirname "$0")/.."

npx prek run --all-files
