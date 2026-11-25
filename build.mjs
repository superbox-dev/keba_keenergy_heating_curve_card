import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = new URL('./', import.meta.url);
const require = createRequire(import.meta.url);
const { version } = require('./package.json');

await build({
  entryPoints: [fileURLToPath(new URL('./src/card.js', root))],
  outfile: fileURLToPath(new URL('./dist/keba_keenergy_heating_curve_card.js', root)),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  legalComments: 'inline',
  define: { __VERSION__: JSON.stringify(version) },
});

console.log(`Built dist/keba_keenergy_heating_curve_card.js ${version}`);
