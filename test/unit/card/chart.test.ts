import { describe, expect, it } from 'vitest';
import '../../../src/card';
import { CardView } from '../../test_helper/card-view';
import { createHass } from '../../fixtures/hass';
import { circuitStates, curveSensor, plain } from '../../fixtures/registry';
import type { FieldKey } from '../../fixtures/registry';
import type { CardConfig, EntityState, FakeHass } from '../../fixtures/types';

/** Home Assistant whose curve table HC1 has the given points. */
const withPoints = (points: unknown, overrides: Partial<Record<FieldKey, EntityState>> = {}): FakeHass =>
  createHass({ states: circuitStates('111', 1, { curve: curveSensor('HC1', points), ...overrides }) });

const chart = async (config: CardConfig = {}, hass = createHass()) => (await CardView.create(config, hass)).chart;

describe('points', () => {
  it('draws and labels the saved points', async () => {
    const view = await chart();

    expect(view.points).toHaveLength(3);
    expect(view.pointLabels).toEqual(['45.0', '35.0', '25.0']);
    expect(view.pointTitles[0]).toBe('P1: outdoor -20.0 °C · table 45.0 °C · limited display 45.0 °C');
    expect(view.curvePath).toMatch(/^M638,/);
  });

  it('anchors the labels at the edges', async () => {
    const view = await chart({}, withPoints([{ outdoor: -20, flow: 45 }, { outdoor: 30, flow: 20 }]));

    expect(view.pointLabelAnchors).toEqual(['end', 'start']);
  });

  it('leaves out invalid and duplicate points', async () => {
    const hass = withPoints([
      { outdoor: -20, flow: 45 },
      { outdoor: -20, flow: 40 },
      { outdoor: 50, flow: 30 },
      { outdoor: 0, flow: 5 },
      { outdoor: 'x', flow: 30 },
      null,
      { outdoor: 20, flow: 25 },
    ]);

    const view = await CardView.create({}, hass);

    expect(view.chart.points).toHaveLength(3);
    expect(view.pointRows).toHaveLength(7);
  });

  it('draws a flat line with one point', async () => {
    const view = await chart({}, withPoints([{ outdoor: 0, flow: 35 }]));

    const xs = view.curveSteps.map(step => step.split(',')[0]);
    const ys = view.curveSteps.map(step => step.split(',')[1]);
    expect(xs).toEqual(['M638', 'L406', 'L58']);
    expect(new Set(ys.map(y => Number(y).toFixed(2)))).toEqual(new Set(['201.78']));
    expect(view.samplePoints).toHaveLength(0);
  });

  it('draws no line without points', async () => {
    const view = await chart({}, withPoints([]));

    expect(view.curvePath).toBe('');
    expect(view.points).toHaveLength(0);
  });

  it('reads no points from an invalid attribute', async () => {
    const view = await CardView.create({}, withPoints('none'));

    expect(view.pointRows).toHaveLength(0);
  });

  it('hides the points outside the axes', async () => {
    const view = await chart({ x_max: 10 });

    expect(view.points).toHaveLength(2);
  });
});

describe('interpolated values', () => {
  it('draws the values between the points', async () => {
    const view = await chart();

    expect(view.sampleOutdoors).toEqual(['-15', '-10', '-5', '5', '10', '15', '25', '30']);
    expect(view.sampleLabels[0]).toBe('42.5');
    expect(view.sampleTitles.at(-1)).toBe('Interpolated value at 30 °C outdoors: 20.0 °C flow');
  });

  it('uses the interval of intermediate_step', async () => {
    const view = await chart({ intermediate_step: 2.5 });

    expect(view.samplePoints).toHaveLength(18);
  });

  it('hides the labels next to the saved points', async () => {
    const view = await chart({ intermediate_step: 1 });

    expect(view.sampleOutdoors).not.toContain('-19');
    expect(view.sampleOutdoors).not.toContain('1');
  });
});

describe('flow limits', () => {
  it('limits the curve to flow_min and flow_max', async () => {
    const view = await chart({ flow_min: 30, flow_max: 40 });

    expect(view.flowLimitLabels).toEqual(['Min 30 °C', 'Max 40 °C']);
    expect(view.flowLimitLines).toHaveLength(2);
    expect(view.pointTitles[0]).toBe('P1: outdoor -20.0 °C · table 45.0 °C · limited display 40.0 °C');
    expect(view.pointLabels).toEqual(['35.0']);
    expect(view.sampleOutdoors).toEqual(['-5', '5']);
    expect(view.curveSteps).toHaveLength(6);
  });

  it('hides flow limits outside the axis', async () => {
    const view = await chart({ flow_max: 80, y_max: 70 });

    expect(view.flowLimitLabels).toHaveLength(0);
  });
});

describe('heating limits and readings', () => {
  it('draws the day and night heating limits', async () => {
    const view = await chart();

    expect(view.heatingLimitLabels).toEqual(['HL Day 18 °C', 'HL Night 15 °C']);
  });

  it('hides heating limits outside the axis', async () => {
    const view = await chart({ x_max: 16 });

    expect(view.heatingLimitLabels).toEqual(['HL Night 15 °C']);
  });

  it('marks the target and the actual flow', async () => {
    const view = await chart();

    // Target 32 °C on the default flow axis from 15 to 60 °C, 320 pixels high with the bottom at 344.
    expect(view.target?.getAttribute('cy')).toBe(String(344 - (32 - 15) / 45 * 320));
    expect(view.actual).not.toBeNull();
  });

  it('marks nothing without outdoor temperature', async () => {
    const view = await chart({}, withPoints([{ outdoor: 0, flow: 35 }], { outdoor: plain('unknown') }));

    expect(view.target).toBeNull();
  });
});

describe('axes', () => {
  it('labels the default axes', async () => {
    const view = await chart();

    expect(view.xAxisLabels).toEqual(['-20', '-15', '-10', '-5', '0', '5', '10', '15', '20', '25', '30']);
    expect(view.yAxisLabels).toEqual(['15', '20', '25', '30', '35', '40', '45', '50', '55', '60']);
  });

  it('uses the axis options', async () => {
    const view = await chart({ x_min: -10, x_max: 10, x_step: 10, y_min: 20, y_max: 50, y_step: 15 });

    expect(view.xAxisLabels).toEqual(['-10', '0', '10']);
    expect(view.yAxisLabels).toEqual(['20', '35', '50']);
  });

  it('leaves out labels of a dense grid', async () => {
    const view = await chart({ y_step: 1 });

    expect(view.gridLines.length - view.axisTexts.length).toBeGreaterThan(20);
    expect(view.yAxisLabels.slice(0, 3)).toEqual(['16', '18', '20']);
  });

  it('widens the automatic axes for the points and limits', async () => {
    const points = [{ outdoor: -35, flow: 75 }, { outdoor: 38, flow: 11 }];

    const view = await chart({ flow_min: 12, flow_max: 70 }, withPoints(points));

    expect([view.xAxisLabels[0], view.xAxisLabels.at(-1)]).toEqual(['-35', '35']);
    expect([view.yAxisLabels[0], view.yAxisLabels.at(-1)]).toEqual(['10', '70']);
  });

  it('names the axes', async () => {
    const view = await chart();

    expect(view.axisTexts.slice(-2)).toEqual(['Outdoor temperature °C', 'Flow °C']);
    expect(view.svg.getAttribute('aria-label'))
      .toBe('Saved heating curve points, interpolated values and current flow temperatures');
    expect(view.curveClipPathId).toBe(view.clipPathId);
  });

  it('uses separate clip paths for each card', async () => {
    const one = await chart();
    const two = await chart();

    expect(one.clipPathId).not.toBe(two.clipPathId);
  });
});
