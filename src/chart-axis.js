// Range and ticks of the chart axes, they only change the chart, never the controller.

/** Grid interval of the axes without the options `x_step` and `y_step`, in °C. */
export const DEFAULT_AXIS_STEP = 5;

/** Smallest grid interval, in °C. */
export const MIN_AXIS_STEP = 0.01;

/** Bounds of the options `x_min`, `x_max`, `y_min` and `y_max`, in °C. */
export const AXIS_LIMITS = {
  x: { min: -100, max: 100 },
  y: { min: 0, max: 150 },
};

/** Bounds and default of the option `intermediate_step`, in °C. */
export const INTERMEDIATE_STEP = {
  min: MIN_AXIS_STEP,
  max: AXIS_LIMITS.x.max - AXIS_LIMITS.x.min,
  default: 5,
};

/**
 * Range of an axis.
 *
 * @typedef {object} AxisRange
 * @property {number} min Minimum.
 * @property {number} max Maximum.
 */

/**
 * Tick of an axis.
 *
 * @typedef {object} AxisTick
 * @property {number} value Value, rounded to 2 decimals.
 * @property {boolean} showLabel Whether the tick has a label.
 */

/**
 * Range of an axis from the fixed bounds of the config and the automatic range of the values.
 *
 * A fixed bound beyond the automatic range moves the other bound by `DEFAULT_AXIS_STEP`.
 *
 * @param {number | null} min Fixed minimum, `null` for automatic.
 * @param {number | null} max Fixed maximum, `null` for automatic.
 * @param {number} autoMin Automatic minimum.
 * @param {number} autoMax Automatic maximum.
 * @returns {AxisRange} The range.
 */
export function axisRange(min, max, autoMin, autoMax) {
  return {
    min: min ?? (max !== null && max <= autoMin ? max - DEFAULT_AXIS_STEP : autoMin),
    max: max ?? (min !== null && min >= autoMax ? min + DEFAULT_AXIS_STEP : autoMax),
  };
}

/**
 * Ticks of an axis, with labels that keep a minimum distance.
 *
 * @param {AxisRange} range Range of the axis.
 * @param {number} step Grid interval.
 * @param {object} options Layout of the axis.
 * @param {boolean} options.fixedMin Whether the minimum is fixed, then the ticks start at the minimum.
 * @param {boolean} options.fixedMax Whether the maximum is fixed, then the maximum always has a labelled tick.
 * @param {number} options.length Length of the axis in SVG units.
 * @param {number} options.labelGap Minimum distance of the labels in SVG units.
 * @returns {AxisTick[]} The ticks.
 */
export function axisTicks({ min, max }, step, { fixedMin, fixedMax, length, labelGap }) {
  const span = max - min;
  // Bound the number of SVG nodes even with a fine step over a wide range.
  const interval = step * Math.max(1, Math.ceil(span / step / 120));
  const labelClearance = labelGap * span / length;
  const labelEvery = Math.ceil(labelClearance / interval);
  const origin = fixedMin ? min : 0;
  const first = Math.ceil((min - origin) / interval - 1e-9);
  const last = Math.floor((max - origin) / interval + 1e-9);
  const ticks = [];
  for (let index = first; index <= last; index++) {
    const value = Math.round((origin + index * interval) * 100) / 100;
    const showLabel = index % labelEvery === 0 && (!fixedMax || max - value >= labelClearance);
    ticks.push({ value, showLabel });
  }
  if (fixedMax) {
    const lastTick = ticks[ticks.length - 1];
    if (lastTick?.value === max) lastTick.showLabel = true;
    else ticks.push({ value: max, showLabel: true });
  }
  return ticks;
}
