import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const root = new URL('./', import.meta.url);
await build({
  entryPoints: [fileURLToPath(new URL('./src/card.js', root))],
  outfile: fileURLToPath(new URL('./keba_keenergy_heating_curve_card.js', root)),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  legalComments: 'inline',
});
console.log('Built keba_keenergy_heating_curve_card.js');
