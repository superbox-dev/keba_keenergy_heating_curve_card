// Points of a heating curve table, temperatures in °C.
import { numeric } from './entities.js';

/** @typedef {import('../types.js').HassEntity} HassEntity */

/**
 * Point of a heating curve table.
 *
 * @typedef {object} CurvePoint
 * @property {number} outdoor Outdoor temperature in °C, `NaN` while the input is empty.
 * @property {number} flow Flow temperature in °C, `NaN` while the input is empty.
 */

/** Limits of the controller for a curve table, the flow range also bounds `flow_min` / `flow_max`. */
export const POINT_LIMITS = {
  count: { min: 1, max: 16 },
  outdoor: { min: -40, max: 40 },
  flow: { min: 10, max: 90 },
};

/** Flow temperature of a new point. */
const NEW_POINT_FLOW = 30;

/** Distance of the outdoor temperatures of new points. */
const NEW_POINT_STEP = 5;

/**
 * Reads the points of the curve sensor.
 *
 * @param {HassEntity | undefined} state State of the curve sensor.
 * @returns {CurvePoint[]} The points in their order, empty when the sensor has none.
 */
export function readPoints(state) {
  const raw = state?.attributes?.points;
  return Array.isArray(raw) ? raw.map(p => ({ outdoor: numeric(p?.outdoor), flow: numeric(p?.flow) })) : [];
}

/**
 * Sorts points by outdoor temperature, in place.
 *
 * @param {CurvePoint[]} points The points.
 * @returns {CurvePoint[]} The same array.
 */
export function sortByOutdoor(points) {
  return points.sort((a, b) => a.outdoor - b.outdoor);
}

/**
 * Whether two point lists are equal.
 *
 * @param {CurvePoint[]} a First list.
 * @param {CurvePoint[]} b Second list.
 * @returns {boolean} `true` when both have the same points in the same order.
 */
export function samePoints(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Whether a point is inside the limits of the controller.
 *
 * @param {CurvePoint} point The point.
 * @returns {boolean} `true` when both temperatures are numbers inside the limits.
 */
export function inLimits({ outdoor, flow }) {
  return Number.isFinite(outdoor) && Number.isFinite(flow)
    && outdoor >= POINT_LIMITS.outdoor.min && outdoor <= POINT_LIMITS.outdoor.max
    && flow >= POINT_LIMITS.flow.min && flow <= POINT_LIMITS.flow.max;
}

/**
 * Prepares points for saving: rounded to 2 decimals and sorted by outdoor temperature.
 *
 * @param {CurvePoint[]} points The points of the draft.
 * @returns {CurvePoint[] | null} The points, `null` when the count, a temperature or a duplicate outdoor temperature
 *   is invalid.
 */
export function pointsToSave(points) {
  const rounded = sortByOutdoor(points.map(p => ({ outdoor: round(p.outdoor), flow: round(p.flow) })));
  const valid = rounded.length >= POINT_LIMITS.count.min && rounded.length <= POINT_LIMITS.count.max
    && rounded.every((p, i) => inLimits(p) && (i === 0 || p.outdoor > rounded[i - 1].outdoor));
  return valid ? rounded : null;
}

/**
 * Outdoor temperature of a new point: the first free multiple of 5 from 0 °C upwards, then from −5 °C downwards.
 *
 * @param {CurvePoint[]} points The current points.
 * @returns {number} The outdoor temperature.
 */
export function newPointOutdoor(points) {
  const taken = (/** @type {number} */ outdoor) => points.some(p => p.outdoor === outdoor);
  let outdoor = 0;
  while (taken(outdoor) && outdoor <= POINT_LIMITS.outdoor.max) outdoor += NEW_POINT_STEP;
  if (outdoor > POINT_LIMITS.outdoor.max) {
    outdoor = -NEW_POINT_STEP;
    while (taken(outdoor) && outdoor >= POINT_LIMITS.outdoor.min) outdoor -= NEW_POINT_STEP;
  }
  return outdoor;
}

/**
 * New point with the default flow temperature.
 *
 * @param {CurvePoint[]} points The current points.
 * @returns {CurvePoint} The point.
 */
export function newPoint(points) {
  return { outdoor: newPointOutdoor(points), flow: NEW_POINT_FLOW };
}

/**
 * Linear interpolation of the flow temperature, extrapolated beyond the first and the last point.
 *
 * @param {number} outdoor Outdoor temperature in °C.
 * @param {CurvePoint[]} points At least one point, sorted by outdoor temperature with unique outdoor temperatures.
 * @returns {number} The flow temperature in °C.
 */
export function interpolate(outdoor, points) {
  if (points.length === 1) return points[0].flow;
  let i = points.findIndex((p, index) => index < points.length - 1 && outdoor <= points[index + 1].outdoor);
  if (i < 0) i = points.length - 2;
  const a = points[i], b = points[i + 1];
  return a.flow + (outdoor - a.outdoor) / (b.outdoor - a.outdoor) * (b.flow - a.flow);
}

/**
 * Rounds to 2 decimals.
 *
 * @param {number} value The value.
 * @returns {number} The rounded value.
 */
function round(value) {
  return Math.round(value * 100) / 100;
}
