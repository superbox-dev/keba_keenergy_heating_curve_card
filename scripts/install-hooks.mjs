// Installs the pre-push hook, which checks pushed release tags with scripts/check-release.sh.
// A small shell file instead of a symlink, because Git Bash on Windows copies symlinks.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SHIM = `#!/bin/sh
# Installed by scripts/install-hooks.mjs, runs scripts/pre-push.sh of the checked out branch.
hook="$(git rev-parse --show-toplevel)/scripts/pre-push.sh"
[ -f "$hook" ] || exit 0
exec "$hook" "$@"
`;

let hooks;

try {
  hooks = execFileSync('git', ['rev-parse', '--git-path', 'hooks'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
} catch {
  console.log('No git repository, the pre-push hook is not installed.');
  process.exit(0);
}

const file = join(hooks, 'pre-push');

mkdirSync(hooks, { recursive: true });
rmSync(file, { force: true });
writeFileSync(file, SHIM, { mode: 0o755 });
console.log(`Installed the pre-push hook at ${file}`);
