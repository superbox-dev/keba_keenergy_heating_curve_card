// Styles of the card, in the shadow root.

/** CSS of the card, the later rules override the earlier ones. */
export const STYLE = `
  :host {
    display: block;
    container-type: inline-size;
    font-family: var(--ha-font-family-body);
    font-size: var(--ha-font-size-m);
    line-height: var(--ha-line-height-normal);
    color: var(--primary-text-color);
    --muted: var(--secondary-text-color);
    --panel: var(--card-background-color);
    --border: var(--divider-color);
  }
  * {
    box-sizing: border-box;
  }
  ha-card {
    overflow: hidden;
  }
  /* Buttons of Home Assistant have one line, the texts around them wrap instead. */
  ha-button {
    flex-shrink: 0;
    white-space: nowrap;
  }
  .layout {
    display: grid;
    /* 8:4 like the 12 columns of the sections view of Home Assistant. */
    grid-template-columns: minmax(0,2fr) minmax(300px,1fr);
    gap: var(--ha-space-6);
    padding: 0 var(--ha-space-4) var(--ha-space-4);
  }
  .chart-panel,.editor {
    min-width: 0;
  }
  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ha-space-3);
    padding: var(--ha-space-1) 0 var(--ha-space-3);
  }
  .curve-table {
    flex-shrink: 0;
    padding: var(--ha-space-1) var(--ha-space-3);
    border-radius: var(--ha-border-radius-pill);
    background: var(--ha-color-fill-primary-quiet-resting);
    color: var(--ha-color-on-primary-normal);
    font-size: var(--ha-font-size-s);
    font-weight: var(--ha-font-weight-medium);
    line-height: var(--ha-line-height-normal);
  }
  .editor-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 0 var(--ha-space-3);
  }
  /* The text takes the space next to the buttons, without room the buttons move below it as one row. */
  .editor-head > div:first-child {
    flex: 1 1 280px;
  }
  h2 {
    margin: 0;
    font-size: var(--ha-card-header-font-size,var(--ha-font-size-2xl));
    line-height: var(--ha-line-height-condensed);
  }
  header p,.editor-head p {
    margin: var(--ha-space-1) 0 0;
    font-size: var(--ha-font-size-m);
    color: var(--muted);
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
  svg line,svg path,svg circle,svg rect {
    vector-effect: non-scaling-stroke;
  }
  .plot {
    fill: var(--panel);
    stroke: var(--border);
  }
  .grid {
    stroke: var(--border);
    stroke-width: .7;
    opacity: .65;
  }
  .curve {
    fill: none;
    stroke: #138e90;
    stroke-width: 3;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .axes {
    fill: var(--muted);
    font-size: calc(var(--ha-font-size-s) * var(--chart-scale));
  }
  .axis-title {
    font-size: calc(var(--ha-font-size-s) * var(--chart-scale));
    font-weight: var(--ha-font-weight-medium);
  }
  .point {
    fill: #138e90;
    stroke: var(--panel);
    stroke-width: 2;
  }
  .point-label {
    fill: #087f82;
    font-size: calc(var(--ha-font-size-s) * var(--chart-scale));
    font-weight: var(--ha-font-weight-bold);
    paint-order: stroke;
    stroke: var(--panel);
    stroke-width: 3px;
  }
  .limit {
    stroke-width: 1.4;
    stroke-dasharray: 5 4;
    opacity: .85;
  }
  .limit.day {
    stroke: #72934b;
  }
  .limit.night {
    stroke: #7885b0;
  }
  .limit-label {
    fill: var(--muted);
    font-size: calc(var(--ha-font-size-xs) * var(--chart-scale));
    font-weight: var(--ha-font-weight-medium);
    paint-order: stroke;
    stroke: var(--panel);
    stroke-width: 3px;
  }
  .target {
    fill: var(--panel);
    stroke: #3b82f6;
    stroke-width: 2.5;
  }
  .actual {
    fill: #e99a4a;
    stroke: var(--panel);
    stroke-width: 1.5;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    padding: 12px 4px 0;
    font-size: var(--ha-font-size-s);
    color: var(--muted);
  }
  .legend span {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .line {
    width: 16px;
    height: 3px;
    border-radius: 3px;
    background: #138e90;
  }
  .line.pale {
    background: #92a5b5;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .dot.target {
    border: 2px solid #3b82f6;
  }
  .dot.actual {
    background: #e99a4a;
  }
  aside {
    min-width: 0;
  }
  h3 {
    margin: 5px 2px 10px;
    font-size: var(--ha-font-size-l);
    font-weight: var(--ha-font-weight-medium);
  }
  .field {
    display: grid;
    gap: 5px;
    font-size: var(--ha-font-size-s);
    color: var(--muted);
  }
  select,input {
    min-width: 0;
    width: 100%;
    padding: 9px 10px;
    border: 1px solid var(--border);
    border-radius: 9px;
    background: var(--panel);
    color: var(--primary-text-color);
    font: inherit;
  }
  .curve-status {
    min-height: 20px;
    margin: 5px 2px 12px;
    font-size: var(--ha-font-size-s);
    color: var(--muted);
  }
  .metrics {
    display: grid;
    grid-template-columns: repeat(2,minmax(0,1fr));
    gap: 8px;
    margin-bottom: 14px;
  }
  .metric {
    display: grid;
    gap: var(--ha-space-2);
    min-height: 75px;
    padding: var(--ha-space-3);
    border-radius: var(--ha-border-radius-lg);
    background: var(--ha-color-fill-neutral-quiet-resting);
  }
  .metric span {
    font-size: var(--ha-font-size-s);
    color: var(--muted);
  }
  .metric b {
    font-size: var(--ha-font-size-xl);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .metric.target b {
    color: var(--ha-color-on-primary-normal);
  }
  .metric.actual b {
    color: var(--ha-color-on-warning-normal);
  }
  .metric.missing b {
    color: var(--muted);
    font-size: var(--ha-font-size-l);
    font-weight: var(--ha-font-weight-normal);
  }
  aside ha-form {
    display: block;
    margin-bottom: var(--ha-space-4);
  }
  button {
    border: 1px solid var(--border);
    border-radius: 9px;
    padding: 9px 12px;
    background: var(--panel);
    color: var(--primary-text-color);
    font: inherit;
    font-size: var(--ha-font-size-m);
    font-weight: var(--ha-font-weight-medium);
    cursor: pointer;
  }
  button:hover:not(:disabled) {
    border-color: var(--ha-color-border-primary-normal);
    color: var(--ha-color-on-primary-normal);
  }
  button:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  .primary {
    background: var(--ha-color-fill-primary-loud-resting);
    border-color: var(--ha-color-fill-primary-loud-resting);
    color: var(--ha-color-on-primary-loud);
  }
  .primary:hover:not(:disabled) {
    background: var(--ha-color-fill-primary-loud-hover);
    color: var(--ha-color-on-primary-loud);
  }
  #save-limits {
    width: 100%;
    margin-top: 9px;
  }
  .notice {
    margin: var(--ha-space-3) 0 0;
    color: var(--muted);
    font-size: var(--ha-font-size-s);
    text-align: center;
    overflow-wrap: anywhere;
  }
  .editor {
    padding: var(--ha-space-4);
    border-top: 1px solid var(--border);
  }
  .editor-head h3 {
    margin: 0 0 5px;
    color: var(--primary-text-color);
  }
  .buttons {
    display: flex;
    flex: 0 0 auto;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
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
    color: var(--muted);
    text-align: right;
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
  }
  @container(max-width:440px) {
    .layout {
      padding: 0 var(--ha-space-3) var(--ha-space-3);
      gap: var(--ha-space-4);
    }
    .editor {
      padding: var(--ha-space-3);
    }
    .metric {
      padding: 9px;
    }
    .metric b {
      font-size: var(--ha-font-size-l);
    }
  }
  .target-panel {
    display: grid;
    grid-template-columns: minmax(0,1.3fr) minmax(0,1fr) auto;
    align-items: center;
    gap: 12px;
    margin-bottom: var(--ha-space-4);
    padding: var(--ha-space-4);
    border-bottom: 1px solid var(--border);
  }
  .target-error {
    grid-column: 1/-1;
    margin: 0;
    font-size: var(--ha-font-size-s);
    color: var(--error-color);
  }
  .target-panel .hint {
    grid-column: 1/-1;
    margin: 0;
  }
  @container(max-width:600px) {
    .target-panel {
      grid-template-columns: 1fr;
    }
    .target-panel ha-button {
      justify-self: start;
    }
  }
  :host {
    pointer-events: auto;
  }
  input,select,button {
    pointer-events: auto;
  }
  .edit-lock {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin: 16px;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--panel);
  }
  .edit-lock-info {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .edit-lock-info ha-icon {
    color: var(--ha-color-on-primary-normal);
    --mdc-icon-size: 21px;
    flex-shrink: 0;
  }
  .edit-lock-info b {
    display: block;
    font-size: var(--ha-font-size-m);
    font-weight: var(--ha-font-weight-medium);
  }
  .edit-lock-info span {
    display: block;
    margin-top: 4px;
    color: var(--muted);
    font-size: var(--ha-font-size-s);
    line-height: 1.5;
  }
  .unlock-form {
    display: grid;
    grid-template-columns: minmax(160px,1fr) auto;
    align-items: end;
    gap: 10px;
    width: 100%;
    padding-top: 10px;
    border-top: 1px solid var(--border);
  }
  .unlock-error {
    grid-column: 1/-1;
    color: var(--error-color);
    font-size: var(--ha-font-size-s);
    min-height: 1em;
  }
  @container(max-width:440px) {
    .edit-lock {
      margin: 8px;
    }
    .unlock-form {
      grid-template-columns: 1fr;
    }
    .unlock-form .buttons {
      width: 100%;
    }
  }
  .setup {
    margin: 16px;
    padding: 14px;
    border: 1px solid var(--ha-color-border-primary-normal);
    border-radius: 12px;
    background: var(--secondary-background-color);
    font-size: var(--ha-font-size-m);
  }
  .setup p {
    line-height: 1.5;
  }
  .hint {
    font-size: var(--ha-font-size-s);
    color: var(--muted);
    line-height: 1.5;
  }
  #setup-details {
    display: block;
    margin: 0 var(--ha-space-4) var(--ha-space-4);
  }
  #setup-details p,#setup-details ul {
    margin: var(--ha-space-1) 0;
  }
  #setup-details li {
    overflow-wrap: anywhere;
  }
  #save-settings {
    display: block;
    width: fit-content;
    margin-left: auto;
  }
  .chart-panel h2 {
    font-size: var(--ha-card-header-font-size,var(--ha-font-size-2xl));
    font-weight: var(--ha-font-weight-normal);
  }
  .plot {
    stroke-width: .7;
  }
  .grid {
    stroke-width: .5;
    opacity: .3;
  }
  .axes {
    font-size: calc(var(--ha-font-size-s) * var(--chart-scale));
    font-weight: var(--ha-font-weight-normal);
  }
  .curve {
    stroke: var(--curve-line,#278F89);
    stroke-width: 1.7;
  }
  .point {
    fill: var(--curve-line,#278F89);
    stroke-width: 1.1;
  }
  .point-label {
    fill: var(--curve-line,#278F89);
    font-size: calc(var(--ha-font-size-s) * var(--chart-scale));
    font-weight: var(--ha-font-weight-bold);
    stroke: var(--panel);
    stroke-width: 2.5px;
    stroke-linejoin: round;
    paint-order: stroke;
  }
  .sample-point {
    fill: var(--curve-line,#278F89);
    opacity: .6;
  }
  .sample-label {
    fill: var(--curve-sample-label,#657B89);
    font-size: calc(var(--ha-font-size-xs) * var(--chart-scale));
    font-weight: var(--ha-font-weight-normal);
    stroke: var(--panel);
    stroke-width: 2px;
    stroke-linejoin: round;
    paint-order: stroke;
  }
  .limit.day,.limit.night {
    stroke-width: .9;
    opacity: .55;
    stroke-dasharray: 4 5;
  }
  .limit-label {
    font-size: calc(var(--ha-font-size-xs) * var(--chart-scale));
    font-weight: var(--ha-font-weight-medium);
    stroke-width: 2px;
  }
  .limit.flow-min {
    stroke: #4D8DC6;
    stroke-width: 1;
    stroke-dasharray: 6 5;
    opacity: .75;
  }
  .limit.flow-max {
    stroke: #CE7373;
    stroke-width: 1;
    stroke-dasharray: 6 5;
    opacity: .75;
  }
  .flow-limit-label {
    font-size: calc(var(--ha-font-size-xs) * var(--chart-scale));
    font-weight: var(--ha-font-weight-medium);
    paint-order: stroke;
    stroke: var(--panel);
    stroke-width: 2px;
  }
  .flow-limit-label.flow-min {
    fill: #4D8DC6;
  }
  .flow-limit-label.flow-max {
    fill: #CE7373;
  }
  .target {
    stroke-width: 1.5;
  }
  .actual {
    stroke-width: 1;
  }
  .legend {
    font-size: var(--ha-font-size-s);
    gap: 12px;
  }
  .legend .line {
    height: 2px;
  }
  .dot.interpolated {
    width: 5px;
    height: 5px;
    background: #8CA1A4;
  }
  .line.flow-range {
    background: linear-gradient(to right,#4D8DC6 50%,#CE7373 50%);
  }
  .metric b {
    font-size: var(--ha-font-size-xl);
  }
  #message {
    display: block;
    margin-top: var(--ha-space-3);
  }
  #message:empty {
    display: none;
  }
`;
