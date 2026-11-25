export const DEFAULT_AXIS_STEP = 5;
export const MIN_AXIS_STEP = 0.01;
export const AXIS_LIMITS = {
  x: { min: -100, max: 100 },
  y: { min: 0, max: 150 },
};

export function axisRange(min, max, autoMin, autoMax) {
  return {
    min: min ?? (max !== null && max <= autoMin ? max - DEFAULT_AXIS_STEP : autoMin),
    max: max ?? (min !== null && min >= autoMax ? min + DEFAULT_AXIS_STEP : autoMax),
  };
}

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
