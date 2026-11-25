import assert from 'node:assert/strict';
import { axisRange, axisTicks, DEFAULT_AXIS_STEP } from '../src/chart-axis.js';

const automatic = { fixedMin: false, fixedMax: false, length: 580, labelGap: 28 };
const fixed = { ...automatic, fixedMin: true, fixedMax: true };
const values = ticks => ticks.map(tick => tick.value);

assert.deepEqual(axisRange(null, null, -20, 30), { min: -20, max: 30 });
assert.deepEqual(axisRange(35, null, -20, 30), { min: 35, max: 40 });
assert.deepEqual(axisRange(null, 15, 15, 60), { min: 10, max: 15 });

const defaultTicks = axisTicks({ min: -27.2, max: 30 }, DEFAULT_AXIS_STEP, automatic);
assert.deepEqual(values(defaultTicks), [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30]);
assert(defaultTicks.every(tick => tick.showLabel));

const fractional = axisTicks({ min: -0.29, max: 0.24 }, 0.1, fixed);
assert.deepEqual(values(fractional), [-0.29, -0.19, -0.09, 0.01, 0.11, 0.21, 0.24]);
assert(fractional[0].showLabel && fractional[fractional.length - 1].showLabel);

const dense = axisTicks({ min: 0, max: 150 }, 0.01, { ...fixed, length: 320, labelGap: 13 });
assert(dense.length <= 122);
assert(dense.filter(tick => tick.showLabel).length < 30);
assert.equal(dense[dense.length - 1].value, 150);
console.log('PASS: automatic and fixed chart ranges, fractional ticks, and grid and label density.');
