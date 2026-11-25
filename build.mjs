import fs from 'node:fs';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';
const root = new URL('./', import.meta.url);
const require = createRequire(import.meta.url);
const license = fs.readFileSync(path.join(path.dirname(require.resolve('@noble/hashes/pbkdf2.js')), 'LICENSE'), 'utf8');
await build({
  entryPoints: [fileURLToPath(new URL('./src/card.js', root))],
  outfile: fileURLToPath(new URL('./keba-keenergy-heizkurve.js', root)),
  bundle: true, format: 'iife', platform: 'browser', target: ['es2020'], legalComments: 'inline',
  banner: { js: '/* KEBA KeEnergy Heizkurve 1.1.0 – allgemeine Custom Card.\nContains @noble/hashes; bundled locally, no runtime downloads.\n' + license + '*/' },
});
console.log('Built keba-keenergy-heizkurve.js');
