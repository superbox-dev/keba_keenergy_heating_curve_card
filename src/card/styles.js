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
  .layout {
    display: grid;
    grid-template-columns: minmax(0,2.1fr) minmax(270px,1fr);
    gap: 16px;
    padding: 16px;
    background: var(--secondary-background-color);
  }
  .chart-panel,.editor {
    min-width: 0;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--ha-card-border-radius,var(--ha-border-radius-lg));
    padding: 16px;
  }
  header,.editor-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 8px 14px;
  }
  header small {
    font-size: var(--ha-font-size-xs);
    font-weight: var(--ha-font-weight-bold);
    letter-spacing: .14em;
    color: #138e90;
  }
  h2 {
    margin: 6px 0;
    font-size: var(--ha-card-header-font-size,var(--ha-font-size-2xl));
  }
  header p,.editor-head p {
    margin: 0;
    font-size: var(--ha-font-size-m);
    color: var(--muted);
  }
  .badge {
    padding: 7px 12px;
    border-radius: 9px;
    background: #e4f2f0;
    color: #087f82;
    font-size: var(--ha-font-size-s);
    font-weight: var(--ha-font-weight-medium);
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
    gap: 8px;
    min-height: 75px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 13px;
    background: var(--panel);
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
  .metric.target {
    background: #eaf6f2;
    color: #087f82;
  }
  .metric.actual {
    background: #fff6eb;
    color: #ac6b24;
  }
  .limit-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
  }
  .limit-fields label {
    display: grid;
    gap: 5px;
    font-size: var(--ha-font-size-s);
    color: var(--muted);
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
    border-color: #138e90;
    color: #087f82;
  }
  button:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  .primary {
    background: #138e90;
    border-color: #138e90;
    color: #fff;
  }
  .primary:hover:not(:disabled) {
    background: #087f82;
    color: #fff;
  }
  #save-limits {
    width: 100%;
    margin-top: 9px;
  }
  .notice {
    margin: 12px 2px 0;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--secondary-background-color);
    color: var(--muted);
    font-size: var(--ha-font-size-s);
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .editor {
    margin: 0 16px 16px;
  }
  .editor-head {
    padding: 0 0 12px;
  }
  .editor-head h3 {
    margin: 0 0 5px;
    color: var(--primary-text-color);
  }
  .buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .table-wrap {
    max-height: 390px;
    overflow: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--ha-font-size-m);
  }
  th,td {
    padding: 7px 8px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }
  th {
    position: sticky;
    top: 0;
    background: var(--panel);
    color: var(--muted);
    font-weight: var(--ha-font-weight-medium);
  }
  td input {
    padding: 7px;
  }
  .remove {
    padding: 5px 9px;
    font-size: var(--ha-font-size-l);
    color: #a54b4b;
  }
  @container(max-width:760px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
  @container(max-width:440px) {
    .layout {
      padding: 8px;
      gap: 10px;
    }
    .chart-panel,.editor {
      padding: 12px;
    }
    .editor {
      margin: 0 8px 8px;
    }
    .editor-head {
      align-items: flex-start;
      flex-direction: column;
    }
    .metric {
      padding: 9px;
    }
    .metric b {
      font-size: var(--ha-font-size-l);
    }
    .buttons {
      width: 100%;
    }
    .buttons button {
      flex: 1;
    }
  }
  .target-panel {
    display: grid;
    grid-template-columns: minmax(0,1.3fr) minmax(0,1fr) auto;
    align-items: end;
    gap: 12px;
    margin: 16px;
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
    .target-panel button {
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
    color: #138e90;
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
    border: 1px solid #138e90;
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
  details {
    padding: 12px;
    font-size: var(--ha-font-size-s);
    line-height: 1.6;
  }
  details code {
    overflow-wrap: anywhere;
  }
  #save-settings {
    width: 100%;
    margin: 9px 0;
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
    fill: var(--curve-point-label,#9A6138);
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
  .notice {
    font-size: var(--ha-font-size-s);
    padding: 8px 10px;
    border-radius: 8px;
  }
`;
