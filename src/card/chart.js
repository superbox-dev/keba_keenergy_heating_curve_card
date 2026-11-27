// SVG chart of the heating curve with the points, the interpolated values, the limits and the readings.
import { DEFAULT_AXIS_STEP, INTERMEDIATE_STEP, axisRange, axisTicks } from '../chart-axis.js';
import { esc, html } from '../html.js';
import { inLimits, interpolate, sortByOutdoor } from './points.js';

/**
 * @typedef {import('../types.js').FormatNumber} FormatNumber
 * @typedef {import('../types.js').Translate} Translate
 * @typedef {import('./config.js').CardConfig} CardConfig
 * @typedef {import('./points.js').CurvePoint} CurvePoint
 */

/**
 * Input of `renderChart()`, temperatures in °C, `NaN` when unknown.
 *
 * @typedef {object} ChartInput
 * @property {CurvePoint[]} points Points of the draft or the curve table.
 * @property {number} outdoor Current outdoor temperature.
 * @property {number} target Target flow temperature of the controller.
 * @property {number} actual Actual flow temperature.
 * @property {number} limitDay Day heating limit.
 * @property {number} limitNight Night heating limit.
 * @property {CardConfig} config Card config with the display limits and the axis options.
 * @property {boolean} dark Whether the dark theme is active.
 * @property {string} plotId Unique ID of the clip path of the card.
 * @property {Translate} t Translates the texts.
 * @property {FormatNumber} number Formats the numbers.
 * @property {(value: number) => string} temperature Formats a temperature with its unit.
 * @property {number} textScale SVG units per pixel, so texts, margins and marks keep their size in pixels.
 */

/** Width of the chart in SVG units, the rendered width gives the text scale. */
export const CHART_WIDTH = 700;

/** Height of the chart in SVG units at the text scale 1. */
const CHART_HEIGHT = 400;

/** Minimum rendered height of the chart in pixels, a narrow chart gets taller. */
const MIN_HEIGHT = 260;

/** Margins of the plot area in pixels, for the axis labels and titles. */
const MARGIN = { left: 58, top: 24, right: 62, bottom: 56 };

/** Default range of the axes without fixed bounds, extended by the points. */
const AUTO_OUTDOOR = { min: -20, max: 30 };
const AUTO_FLOW = { min: 15, max: 60 };

/** Distance in pixels below which interpolated values get no label next to a point. */
const SAMPLE_LABEL_GAP = 25;

/**
 * Renders the chart.
 *
 * @param {ChartInput} input Points, readings and options.
 * @returns {string} The SVG element.
 */
export function renderChart(input) {
  const { config, t, number, temperature, textScale } = input;
  /**
   * A size in pixels in SVG units, rounded to 2 decimals.
   *
   * @param {number} pixels
   */
  const units = pixels => Math.round(pixels * textScale * 100) / 100;
  const height = Math.max(CHART_HEIGHT, units(MIN_HEIGHT));
  const plotLeft = units(MARGIN.left), plotTop = units(MARGIN.top);
  const plotRight = CHART_WIDTH - units(MARGIN.right), plotBottom = height - units(MARGIN.bottom);
  const plotWidth = plotRight - plotLeft, plotHeight = plotBottom - plotTop;
  const sampleLabelGap = units(SAMPLE_LABEL_GAP);
  const valid = sortByOutdoor(input.points.filter(inLimits));
  const minimum = config.flow_min ?? -Infinity, maximum = config.flow_max ?? Infinity;
  /** @param {number} value */
  const clamp = value => Math.max(minimum, Math.min(maximum, value));
  const unique = valid.filter((p, i) => !i || p.outdoor !== valid[i - 1].outdoor);

  const outdoorValues = valid.map(p => p.outdoor);
  const flowValues = valid.map(p => clamp(p.flow));
  const lowestFlow = Math.min(AUTO_FLOW.min, minimum === -Infinity ? AUTO_FLOW.min : minimum, ...flowValues);
  const highestFlow = Math.max(AUTO_FLOW.max, maximum === Infinity ? AUTO_FLOW.max : maximum, ...flowValues);
  const autoBottom = Math.floor(lowestFlow / 5) * 5;
  const autoTop = Math.ceil(highestFlow / 5) * 5;
  const lowestOutdoor = Math.min(AUTO_OUTDOOR.min, ...outdoorValues);
  const highestOutdoor = Math.max(AUTO_OUTDOOR.max, ...outdoorValues);
  const outdoorRange = axisRange(config.x_min, config.x_max, lowestOutdoor, highestOutdoor);
  const flowRange = axisRange(config.y_min, config.y_max, autoBottom, autoTop);
  const { min: lo, max: hi } = outdoorRange;
  const { min: bottom, max: top } = flowRange;

  /** @param {number} outdoor */
  const x = outdoor => plotLeft + (hi - outdoor) / (hi - lo) * plotWidth;
  /** @param {number} flow */
  const y = flow => plotBottom - (flow - bottom) / (top - bottom) * plotHeight;
  /**
   * @param {number} outdoor
   * @param {number} flow
   */
  const visible = (outdoor, flow) => outdoor >= lo && outdoor <= hi && flow >= bottom && flow <= top;
  /** @param {number} value */
  const decimal = value => number(value, { minimumFractionDigits: 1 });
  /** @param {number} value */
  const tickLabel = value => esc(number(value, { maximumFractionDigits: 2 }));

  let grid = '';
  const outdoorTicks = axisTicks(outdoorRange, config.x_step ?? DEFAULT_AXIS_STEP, {
    fixedMin: config.x_min !== null,
    fixedMax: config.x_max !== null,
    length: plotWidth,
    labelGap: units(28),
  });
  for (const { value, showLabel } of outdoorTicks) {
    const tickX = x(value);
    grid += `<line x1="${tickX}" y1="${plotTop}" x2="${tickX}" y2="${plotBottom}" class="grid"/>`;
    if (showLabel) grid += `<text x="${tickX}" y="${plotBottom + units(21)}" text-anchor="middle">${tickLabel(value)}</text>`;
  }
  const flowTicks = axisTicks(flowRange, config.y_step ?? DEFAULT_AXIS_STEP, {
    fixedMin: config.y_min !== null,
    fixedMax: config.y_max !== null,
    length: plotHeight,
    labelGap: units(16),
  });
  for (const { value, showLabel } of flowTicks) {
    const py = y(value);
    grid += `<line x1="${plotLeft}" y1="${py}" x2="${plotRight}" y2="${py}" class="grid"/>`;
    if (showLabel) grid += `<text x="${plotLeft - units(10)}" y="${py + units(4)}" text-anchor="end">${tickLabel(value)}</text>`;
  }

  let limits = '';
  for (const { value, cls, label, labelY } of [
    { value: input.limitDay, cls: 'day', label: t('Day'), labelY: units(16) },
    { value: input.limitNight, cls: 'night', label: t('Night'), labelY: units(34) },
  ]) {
    if (!Number.isFinite(value) || value < lo || value > hi) continue;
    const px = x(value);
    limits += html`<line x1="${px}" y1="${plotTop}" x2="${px}" y2="${plotBottom}" class="limit ${cls}"/>
      <text x="${Math.max(plotLeft + units(52), Math.min(plotRight - units(53), px))}" y="${labelY}"
        text-anchor="middle" class="limit-label">
        ${esc(t('HL'))} ${esc(label)} ${esc(temperature(value))}
      </text>`;
  }
  for (const { value, cls, label } of [
    { value: minimum, cls: 'flow-min', label: t('Min') },
    { value: maximum, cls: 'flow-max', label: t('Max') },
  ]) {
    if (value < bottom || value > top) continue;
    const py = y(value);
    limits += html`<line x1="${plotLeft}" y1="${py}" x2="${plotRight}" y2="${py}" class="limit ${cls}"/>
      <text x="${plotRight - units(6)}" y="${py - units(7)}" text-anchor="end" class="flow-limit-label ${cls}">
        ${esc(label)} ${esc(temperature(value))}
      </text>`;
  }

  let dots = '';
  valid.forEach((p, i) => {
    const shown = clamp(p.flow);
    if (!visible(p.outdoor, shown)) return;
    const px = x(p.outdoor), py = y(shown);
    const anchor = px <= plotLeft + units(17) ? 'start' : px >= plotRight - units(18) ? 'end' : 'middle';
    const label = shown > minimum && shown < maximum
      ? html`<text x="${px}" y="${Math.max(units(17), py - units(12))}" text-anchor="${anchor}" class="point-label">
          ${esc(decimal(shown))}
        </text>`
      : '';
    const tooltip = t('P{index}: outdoor {outdoor} °C · table {flow} °C · limited display {shown} °C', {
      index: i + 1,
      outdoor: decimal(p.outdoor),
      flow: decimal(p.flow),
      shown: decimal(shown),
    });
    dots += html`<g>
      <title>${esc(tooltip)}</title>
      <circle cx="${px}" cy="${py}" r="${units(2.8)}" class="point"/>
      ${label}
    </g>`;
  });

  let samples = '';
  if (unique.length > 1) {
    const pointTemperatures = new Set(unique.map(point => point.outdoor));
    const sampleTicks = axisTicks(outdoorRange, config.intermediate_step ?? INTERMEDIATE_STEP.default, {
      fixedMin: false,
      fixedMax: false,
      length: plotWidth,
      labelGap: sampleLabelGap,
    });
    for (const { value: outdoor, showLabel } of sampleTicks) {
      if (pointTemperatures.has(outdoor)) continue;
      const shown = clamp(interpolate(outdoor, unique));
      if (!visible(outdoor, shown) || shown <= minimum || shown >= maximum) continue;
      const px = x(outdoor), py = y(shown);
      // Keep the sample markers at the chosen interval and give saved point labels priority.
      const flowLabel = decimal(shown);
      const labelY = Math.max(units(17), py - units(9));
      const label = showLabel && !unique.some(point => Math.abs(x(point.outdoor) - px) < sampleLabelGap)
        ? html`<text x="${px}" y="${labelY}" text-anchor="middle" class="sample-label" data-outdoor="${outdoor}">
            ${esc(flowLabel)}
          </text>`
        : '';
      const tooltip = t('Interpolated value at {outdoor} °C outdoors: {flow} °C flow', {
        outdoor: number(outdoor, { maximumFractionDigits: 2 }),
        flow: flowLabel,
      });
      samples += html`<g>
        <title>${esc(tooltip)}</title>
        <circle cx="${px}" cy="${py}" r="${units(1.7)}" class="sample-point"/>
        ${label}
      </g>`;
    }
  }

  let marks = '';
  for (const { value, cls, radius } of [
    { value: input.target, cls: 'target', radius: 3.8 },
    { value: input.actual, cls: 'actual', radius: 3 },
  ]) {
    if (visible(input.outdoor, value)) {
      marks += `<circle cx="${x(input.outdoor)}" cy="${y(value)}" r="${units(radius)}" class="${cls}"/>`;
    }
  }

  const path = curvePath(unique, lo, hi, minimum, maximum, (outdoor, flow) => x(outdoor) + ',' + y(clamp(flow)));
  const plot = `x="${plotLeft}" y="${plotTop}" width="${plotWidth}" height="${plotHeight}"`;
  const label = esc(t('Saved heating curve points, interpolated values and current flow temperatures'));
  return html`<svg viewBox="0 0 ${CHART_WIDTH} ${height}" style="${palette(input.dark, textScale)}" aria-label="${label}" role="img">
    <defs><clipPath id="${input.plotId}" clipPathUnits="userSpaceOnUse"><rect ${plot}/></clipPath></defs>
    <rect ${plot} rx="${units(8)}" class="plot"/>
    <g class="axes">${grid}</g>
    ${limits}
    <path d="${path}" class="curve" clip-path="url(#${input.plotId})"/>
    ${samples}${dots}${marks}
    <g class="axes">
      <text x="${plotLeft + plotWidth / 2}" y="${height - units(7)}" text-anchor="middle">
        ${esc(t('Outdoor temperature'))} °C
      </text>
      <text x="${units(15)}" y="${plotTop + plotHeight / 2}" text-anchor="middle"
        transform="rotate(-90 ${units(15)} ${plotTop + plotHeight / 2})">${esc(t('Flow °C'))}</text>
    </g>
  </svg>`;
}

/**
 * Path of the curve over the whole outdoor axis, with extra corners where it crosses the display limits.
 *
 * @param {CurvePoint[]} points Points with unique outdoor temperatures, sorted.
 * @param {number} lo Minimum of the outdoor axis.
 * @param {number} hi Maximum of the outdoor axis.
 * @param {number} minimum Lower display limit of the flow temperature, `-Infinity` without limit.
 * @param {number} maximum Upper display limit of the flow temperature, `Infinity` without limit.
 * @param {(outdoor: number, flow: number) => string} coordinates SVG coordinates of an outdoor and a flow temperature.
 * @returns {string} The `d` attribute, empty without points.
 */
function curvePath(points, lo, hi, minimum, maximum, coordinates) {
  if (!points.length) return '';
  /** @param {number} outdoor */
  const flow = outdoor => interpolate(outdoor, points);
  const xs = [lo, ...points.map(p => p.outdoor).filter(outdoor => outdoor > lo && outdoor < hi), hi];
  const crossings = [];
  for (let i = 0; i < xs.length - 1; i++) {
    const a = flow(xs[i]), b = flow(xs[i + 1]);
    for (const limit of [minimum, maximum]) {
      if ((a - limit) * (b - limit) < 0) crossings.push(xs[i] + (limit - a) / (b - a) * (xs[i + 1] - xs[i]));
    }
  }
  return [...new Set([...xs, ...crossings])]
    .sort((a, b) => a - b)
    .map((outdoor, i) => (i ? 'L' : 'M') + coordinates(outdoor, flow(outdoor)))
    .join(' ');
}

/**
 * Colors of the curve for the light and the dark theme and the scale of the texts.
 *
 * @param {boolean} dark Whether the dark theme is active.
 * @param {number} textScale SVG units per pixel.
 * @returns {string} CSS custom properties for the `style` attribute.
 */
function palette(dark, textScale) {
  return [
    `--chart-scale:${textScale}`,
    `--curve-point-label:${dark ? '#D8AE8B' : '#9A6138'}`,
    `--curve-sample-label:${dark ? '#9BACB8' : '#657B89'}`,
    `--curve-line:${dark ? '#65B4B0' : '#278F89'}`,
  ].join(';');
}
