import { describe, expect, it } from 'vitest';
import { axisRange, axisTicks, DEFAULT_AXIS_STEP } from '../../src/chart-axis';

interface Tick {
  value: number;
  showLabel: boolean;
}

const AUTOMATIC = { fixedMin: false, fixedMax: false, length: 580, labelGap: 28 };
const FIXED = { ...AUTOMATIC, fixedMin: true, fixedMax: true };

const values = (ticks: Tick[]): number[] => ticks.map(tick => tick.value);
const labels = (ticks: Tick[]): boolean[] => ticks.map(tick => tick.showLabel);

describe('axisRange', () => {
  it('uses the automatic range without bounds', () => {
    expect(axisRange(null, null, -20, 30)).toEqual({ min: -20, max: 30 });
  });

  it('uses the given bounds', () => {
    expect(axisRange(-10, 10, -20, 30)).toEqual({ min: -10, max: 10 });
  });

  it('moves the automatic maximum above a minimum over it', () => {
    expect(axisRange(35, null, -20, 30)).toEqual({ min: 35, max: 40 });
  });

  it('moves the automatic minimum below a maximum under it', () => {
    expect(axisRange(null, 15, 15, 60)).toEqual({ min: 10, max: 15 });
  });

  it('keeps the automatic side when the bound fits', () => {
    expect(axisRange(0, null, -20, 30)).toEqual({ min: 0, max: 30 });
    expect(axisRange(null, 20, -20, 30)).toEqual({ min: -20, max: 20 });
  });
});

describe('axisTicks', () => {
  it('places the ticks on multiples of the step', () => {
    const ticks: Tick[] = axisTicks({ min: -27.2, max: 30 }, DEFAULT_AXIS_STEP, AUTOMATIC);

    expect(values(ticks)).toEqual([-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30]);
    expect(labels(ticks).every(Boolean)).toBe(true);
  });

  it('starts fixed ranges at the minimum and labels both ends', () => {
    const ticks: Tick[] = axisTicks({ min: -0.29, max: 0.24 }, 0.1, FIXED);

    expect(values(ticks)).toEqual([-0.29, -0.19, -0.09, 0.01, 0.11, 0.21, 0.24]);
    expect(ticks[0].showLabel).toBe(true);
    expect(ticks.at(-1)?.showLabel).toBe(true);
  });

  it('hides the label next to a fixed maximum', () => {
    const ticks: Tick[] = axisTicks({ min: 0, max: 10.5 }, 5, { ...FIXED, length: 100 });

    expect(values(ticks)).toEqual([0, 5, 10, 10.5]);
    expect(labels(ticks)).toEqual([true, true, false, true]);
  });

  it('labels a fixed maximum on a tick', () => {
    const ticks: Tick[] = axisTicks({ min: 0, max: 10 }, 5, FIXED);

    expect(values(ticks)).toEqual([0, 5, 10]);
    expect(ticks.at(-1)?.showLabel).toBe(true);
  });

  it('limits the number of ticks and labels', () => {
    const ticks: Tick[] = axisTicks({ min: 0, max: 150 }, 0.01, { ...FIXED, length: 320, labelGap: 13 });

    expect(ticks.length).toBeLessThanOrEqual(122);
    expect(labels(ticks).filter(Boolean).length).toBeLessThan(30);
    expect(ticks.at(-1)?.value).toBe(150);
  });

  it('adds a fixed maximum to an empty range', () => {
    const ticks: Tick[] = axisTicks({ min: 0.1, max: 0.2 }, 5, { ...AUTOMATIC, fixedMax: true });

    expect(ticks).toEqual([{ value: 0.2, showLabel: true }]);
  });
});
