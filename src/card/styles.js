// Styles of the card, in the shadow root.

/** CSS of the card, with the fonts, spacings, radii and colors of Home Assistant. */
export const STYLE = `
  :host {
    display: block;
    container-type: inline-size;
    font-family: var(--ha-font-family-body);
    font-size: var(--ha-font-size-m);
    line-height: var(--ha-line-height-normal);
    color: var(--primary-text-color);
    /* The colors of the chart from the palette of the charts of Home Assistant, a theme can change them. */
    --chart-curve: var(--graph-color-1,var(--color-1));
    --chart-target: var(--graph-color-9,var(--color-9));
    --chart-actual: var(--graph-color-2,var(--color-2));
    --chart-flow-max: var(--graph-color-3,var(--color-3));
    --chart-day: var(--graph-color-4,var(--color-4));
    --chart-night: var(--graph-color-5,var(--color-5));
    --chart-flow-min: var(--graph-color-8,var(--color-8));
    /* Texts in the chart get an outline in the color of the card, so lines behind them do not cross them. */
    --chart-halo: var(--ha-card-background,var(--card-background-color));
  }
  * {
    box-sizing: border-box;
  }
  ha-card {
    overflow: hidden;
  }
  [hidden] {
    display: none !important;
  }
  /* Buttons of Home Assistant have one line, the texts around them wrap instead. */
  ha-button {
    flex-shrink: 0;
    white-space: nowrap;
  }
  ha-alert {
    display: block;
  }
  ha-alert:empty {
    display: none;
  }

  /* Controller and heating circuit. */
  .target-panel {
    display: grid;
    grid-template-columns: minmax(0,1.3fr) minmax(0,1fr) auto;
    align-items: center;
    gap: var(--ha-space-3);
    margin-bottom: var(--ha-space-4);
    padding: 0 var(--ha-space-4) var(--ha-space-4);
    border-bottom: var(--ha-border-width-sm) solid var(--divider-color);
  }
  .target-panel ha-alert {
    grid-column: 1/-1;
  }

  /* Notices above the chart. */
  #setup-details,#enable-panel,.edit-lock {
    margin: 0 var(--ha-space-4) var(--ha-space-4);
  }
  #setup-details p,#setup-details ul {
    margin: var(--ha-space-1) 0;
  }
  #setup-details li {
    overflow-wrap: anywhere;
  }
  /*
   * The password and its buttons in one row, below 600 px the buttons below the field. The field of Home Assistant
   * keeps room for a hint below it, so the rows need no gap and the buttons center on the 56 px of the field.
   */
  .unlock-form {
    display: grid;
    grid-template-columns: minmax(0,1fr) auto;
    align-items: start;
    column-gap: var(--ha-space-3);
    margin-top: var(--ha-space-3);
  }
  .unlock-form .buttons {
    align-items: center;
    min-height: var(--ha-space-14);
  }
  .unlock-form ha-alert {
    grid-column: 1/-1;
  }

  /* Chart and settings, 8:4 like the 12 columns of the sections view of Home Assistant. */
  .layout {
    display: grid;
    grid-template-columns: minmax(0,2fr) minmax(300px,1fr);
    gap: var(--ha-space-6);
    padding: 0 var(--ha-space-4) var(--ha-space-4);
  }
  .chart-panel,aside,.editor {
    min-width: 0;
  }
  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ha-space-3);
    padding: var(--ha-space-1) 0 var(--ha-space-3);
  }
  h2 {
    margin: 0;
    font-size: var(--ha-font-size-l);
    font-weight: var(--ha-font-weight-medium);
    line-height: var(--ha-line-height-condensed);
  }
  header p,.editor-head p {
    margin: var(--ha-space-1) 0 0;
    color: var(--secondary-text-color);
  }
  .curve-table {
    flex-shrink: 0;
    padding: var(--ha-space-1) var(--ha-space-3);
    border-radius: var(--ha-border-radius-pill);
    background: var(--ha-color-fill-primary-quiet-resting);
    color: var(--ha-color-on-primary-normal);
    font-size: var(--ha-font-size-s);
    font-weight: var(--ha-font-weight-medium);
  }

  /* The chart, sizes in pixels times --chart-scale, so they keep their size when the chart scales. */
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
  svg line,svg path,svg circle {
    vector-effect: non-scaling-stroke;
  }
  svg text {
    font-size: calc(var(--ha-font-size-s) * var(--chart-scale));
  }
  .axes {
    fill: var(--secondary-text-color);
  }
  /*
   * Grid lines without a frame around the plot, like the charts of Home Assistant. They use the border color of
   * Home Assistant, the divider color of some themes is nearly the color of the card.
   */
  .grid {
    stroke: var(--ha-color-border-neutral-normal);
    stroke-width: 1;
    opacity: .35;
  }
  .curve {
    fill: none;
    stroke: var(--chart-curve);
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .point {
    fill: var(--chart-curve);
    stroke: var(--chart-halo);
    stroke-width: 1;
  }
  .sample-point {
    fill: var(--chart-curve);
    opacity: .6;
  }
  .point-label,.sample-label,.limit-label,.flow-limit-label {
    paint-order: stroke;
    stroke: var(--chart-halo);
    stroke-width: 2px;
    stroke-linejoin: round;
  }
  .point-label {
    fill: var(--chart-curve);
    font-weight: var(--ha-font-weight-bold);
  }
  .sample-label,.limit-label,.flow-limit-label {
    font-size: calc(var(--ha-font-size-xs) * var(--chart-scale));
  }
  .sample-label {
    fill: var(--secondary-text-color);
  }
  .limit-label,.flow-limit-label {
    font-weight: var(--ha-font-weight-medium);
  }
  .limit-label {
    fill: var(--secondary-text-color);
  }
  .limit {
    stroke-width: 1;
    stroke-dasharray: 4 5;
  }
  .limit.day {
    stroke: var(--chart-day);
  }
  .limit.night {
    stroke: var(--chart-night);
  }
  .limit.flow-min,.limit.flow-max {
    stroke-dasharray: 6 5;
  }
  .limit.flow-min {
    stroke: var(--chart-flow-min);
  }
  .limit.flow-max {
    stroke: var(--chart-flow-max);
  }
  .flow-limit-label.flow-min {
    fill: var(--chart-flow-min);
  }
  .flow-limit-label.flow-max {
    fill: var(--chart-flow-max);
  }
  circle.target {
    fill: var(--chart-halo);
    stroke: var(--chart-target);
    stroke-width: 2;
  }
  circle.actual {
    fill: var(--chart-actual);
    stroke: var(--chart-halo);
    stroke-width: 1;
  }

  /* Legend below the chart. */
  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--ha-space-3);
    padding: var(--ha-space-3) var(--ha-space-1) 0;
    font-size: var(--ha-font-size-s);
    color: var(--secondary-text-color);
  }
  .legend > span {
    display: flex;
    align-items: center;
    gap: var(--ha-space-1);
  }
  .line {
    width: var(--ha-space-4);
    height: var(--ha-border-width-md);
    border-radius: var(--ha-border-radius-pill);
    background: var(--chart-curve);
  }
  .line.flow-range {
    background: linear-gradient(to right,var(--chart-flow-min) 50%,var(--chart-flow-max) 50%);
  }
  .dot {
    width: var(--ha-space-2);
    height: var(--ha-space-2);
    border-radius: var(--ha-border-radius-circle);
  }
  .dot.target {
    border: var(--ha-border-width-md) solid var(--chart-target);
  }
  .dot.actual {
    background: var(--chart-actual);
  }
  .dot.interpolated {
    width: var(--ha-space-1);
    height: var(--ha-space-1);
    background: var(--chart-curve);
    opacity: .6;
  }
  .notice,#message {
    margin-top: var(--ha-space-3);
  }
  .notice {
    overflow-wrap: anywhere;
  }

  /* Settings on the right. */
  aside h3 {
    margin: 0 0 var(--ha-space-2);
    font-size: var(--ha-font-size-m);
    font-weight: var(--ha-font-weight-medium);
    line-height: var(--ha-line-height-condensed);
  }
  aside ha-form {
    display: block;
    margin-bottom: var(--ha-space-4);
  }
  .metrics {
    display: grid;
    grid-template-columns: repeat(2,minmax(0,1fr));
    gap: var(--ha-space-2);
    margin-bottom: var(--ha-space-4);
  }
  .metric {
    display: grid;
    gap: var(--ha-space-2);
    padding: var(--ha-space-3);
    border-radius: var(--ha-border-radius-lg);
    background: var(--ha-color-fill-neutral-quiet-resting);
  }
  .metric span {
    font-size: var(--ha-font-size-s);
    color: var(--secondary-text-color);
  }
  .metric b {
    font-size: var(--ha-font-size-xl);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .metric.target b {
    color: var(--ha-color-on-success-normal);
  }
  .metric.actual b {
    color: var(--ha-color-on-warning-normal);
  }
  .metric.missing b {
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-l);
    font-weight: var(--ha-font-weight-normal);
  }
  #save-settings {
    display: block;
    width: fit-content;
    margin-left: auto;
  }

  /* Editor of the points. */
  .editor {
    padding: var(--ha-space-4);
    border-top: var(--ha-border-width-sm) solid var(--divider-color);
  }
  .editor-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--ha-space-3);
    padding-bottom: var(--ha-space-3);
  }
  /* The text takes the space next to the buttons, without room the buttons move below it as one row. */
  .editor-head > div:first-child {
    flex: 1 1 280px;
  }
  .editor-head h3 {
    margin: 0 0 var(--ha-space-1);
    font-size: var(--ha-card-header-font-size,var(--ha-font-size-2xl));
    font-weight: var(--ha-font-weight-normal);
    line-height: var(--ha-line-height-condensed);
  }
  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--ha-space-2);
    margin-left: auto;
  }
  .point-row {
    display: grid;
    grid-template-columns: 2em minmax(0,1fr) auto;
    align-items: center;
    gap: var(--ha-space-2);
    padding: var(--ha-space-1) 0;
  }
  .point-number {
    color: var(--secondary-text-color);
    text-align: right;
  }
  .hint {
    font-size: var(--ha-font-size-s);
    color: var(--secondary-text-color);
  }

  /* Below 900 px the chart takes the whole width, the readings stand in one row below it. */
  @container(max-width:900px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .metrics {
      grid-template-columns: repeat(4,minmax(0,1fr));
    }
  }
  @container(max-width:600px) {
    .metrics {
      grid-template-columns: repeat(2,minmax(0,1fr));
    }
    .target-panel {
      grid-template-columns: 1fr;
    }
    .target-panel ha-button {
      justify-self: start;
    }
    .unlock-form {
      grid-template-columns: 1fr;
    }
  }
  @container(max-width:440px) {
    .layout {
      gap: var(--ha-space-4);
      padding: 0 var(--ha-space-3) var(--ha-space-3);
    }
    .editor {
      padding: var(--ha-space-3);
    }
    #setup-details,#enable-panel,.edit-lock {
      margin: 0 var(--ha-space-3) var(--ha-space-3);
    }
    .metric {
      padding: var(--ha-space-2);
    }
    .metric b {
      font-size: var(--ha-font-size-l);
    }
  }
`;
