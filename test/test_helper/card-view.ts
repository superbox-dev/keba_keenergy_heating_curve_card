// Page object of the card: its elements by name and the actions of the user.
import { vi } from 'vitest';
import { PASSWORD } from '../fixtures/password';
import { settle, ShadowView } from './shadow-view';
import type { SelectOption } from './shadow-view';
import type { CardConfig, FakeHass, HeatingCurveCard } from '../fixtures/types';

export type HeatingLimit = 'limitDay' | 'limitNight';
export type PointAxis = 'outdoor' | 'flow';
export type Reading = 'outdoor' | 'target' | 'actual' | 'points';

export class CardView extends ShadowView<HeatingCurveCard> {
  readonly chart = new ChartView(this);

  /** Adds the card to the page, sets the config and Home Assistant and waits until it is rendered. */
  static async create(config: CardConfig = {}, hass?: FakeHass): Promise<CardView> {
    const view = new CardView(document.createElement('keba-keenergy-heating-curve-card'));
    document.body.append(view.element);
    view.element.setConfig(config);
    if (hass) view.element.hass = hass;
    await settle();
    return view;
  }

  /** Sends a new hass object, like Home Assistant on every state change. */
  set hass(hass: Partial<FakeHass>) {
    this.element.hass = hass;
  }

  setConfig(config: CardConfig): void {
    this.element.setConfig(config);
  }

  // Header and status.

  get title(): string | undefined {
    return this.text('h2');
  }

  /** The curve mode below the title. */
  get mode(): string | undefined {
    return this.text('.chart-panel header p');
  }

  /** The curve table in the header. */
  get badge(): string | undefined {
    return this.text('.badge');
  }

  get message(): string | undefined {
    return this.text('#message');
  }

  get notice(): string | undefined {
    return this.text('.chart-panel p.notice');
  }

  get legend(): string | undefined {
    return this.text('.legend');
  }

  /** The curve name in the legend, with ` · Draft` for unsaved points. */
  get curveLabel(): string | undefined {
    return this.text('#curve-label');
  }

  reading(key: Reading): string | undefined {
    return this.text(`[data-live="${key}"]`);
  }

  // Controller, heating circuit and curve table.

  get controllerSelect(): HTMLSelectElement {
    return this.get('#controller-select');
  }

  get circuitSelect(): HTMLSelectElement {
    return this.get('#circuit-select');
  }

  get curveSelect(): HTMLSelectElement {
    return this.get('#curve-select');
  }

  get controllerOptions(): SelectOption[] {
    return this.options('#controller-select');
  }

  get circuitOptions(): SelectOption[] {
    return this.options('#circuit-select');
  }

  get curveOptions(): SelectOption[] {
    return this.options('#curve-select');
  }

  /** The error of the controller and heating circuit mapping. */
  get mappingError(): string | undefined {
    return this.text('.target-error');
  }

  /** The hint of the entity registry below the selects. */
  get registryHint(): string | undefined {
    return this.text('.target-panel .hint');
  }

  get reloadButton(): HTMLButtonElement {
    return this.get('#reload-registry');
  }

  selectController(id: string): Promise<void> {
    return this.change(this.controllerSelect, id);
  }

  selectCircuit(id: string): Promise<void> {
    return this.change(this.circuitSelect, id);
  }

  selectCurve(table: string): Promise<void> {
    return this.change(this.curveSelect, table);
  }

  reloadRegistry(): Promise<void> {
    return this.click(this.reloadButton);
  }

  // Heating limits.

  limitInput(key: HeatingLimit): HTMLInputElement {
    return this.get(`[data-setting="${key}"]`);
  }

  get saveLimitsButton(): HTMLButtonElement {
    return this.get('#save-settings');
  }

  setLimit(key: HeatingLimit, value: string | number): Promise<void> {
    return this.input(this.limitInput(key), value);
  }

  saveLimits(): Promise<void> {
    return this.click(this.saveLimitsButton);
  }

  // Point table.

  pointInput(index: number, axis: PointAxis): HTMLInputElement {
    return this.get(`[data-point="${index}"][data-axis="${axis}"]`);
  }

  removeButton(index: number): HTMLButtonElement {
    return this.get(`[data-remove="${index}"]`);
  }

  get pointRows(): HTMLTableRowElement[] {
    return this.queryAll('tbody tr');
  }

  /** The values of the point table, as `[outdoor, flow]` per row. */
  get pointValues(): string[][] {
    return this.pointRows.map(row => [...row.querySelectorAll('input')].map(field => field.value));
  }

  get tableWrap(): HTMLElement {
    return this.get('.table-wrap');
  }

  get addPointButton(): HTMLButtonElement {
    return this.get('#add-point');
  }

  get savePointsButton(): HTMLButtonElement {
    return this.get('#save-points');
  }

  get discardButton(): HTMLButtonElement {
    return this.get('#reset');
  }

  setPoint(index: number, axis: PointAxis, value: string | number): Promise<void> {
    return this.input(this.pointInput(index, axis), value);
  }

  addPoint(): Promise<void> {
    return this.click(this.addPointButton);
  }

  removePoint(index: number): Promise<void> {
    return this.click(this.removeButton(index));
  }

  savePoints(): Promise<void> {
    return this.click(this.savePointsButton);
  }

  discardDraft(): Promise<void> {
    return this.click(this.discardButton);
  }

  // Setup hints and disabled entities.

  /** The collapsible hints for missing entities and actions, `null` if everything is there. */
  get setupHints(): HTMLDetailsElement | null {
    return this.query('details');
  }

  get missingEntities(): string[] {
    return this.texts('details li');
  }

  get retryButton(): HTMLButtonElement {
    return this.get('#retry');
  }

  /** The panel to enable disabled entities, `null` without disabled entities. */
  get enablePanel(): HTMLElement | null {
    return this.query('.setup');
  }

  get enableButton(): HTMLButtonElement {
    return this.get('#enable-editors');
  }

  enableEntities(): Promise<void> {
    return this.click(this.enableButton);
  }

  // Password protection.

  /** The password panel, `null` without `edit_password_hash`. */
  get lockPanel(): HTMLElement | null {
    return this.query('.edit-lock');
  }

  /** `Editing locked` or `Editing unlocked`. */
  get lockStatus(): string | undefined {
    return this.text('.edit-lock-info b');
  }

  get lockHint(): string | undefined {
    return this.text('.edit-lock-info span');
  }

  get unlockButton(): HTMLButtonElement {
    return this.get('#unlock-editor');
  }

  get lockButton(): HTMLButtonElement {
    return this.get('#lock-editor');
  }

  /** The unlock form, `null` while it is closed. */
  get unlockForm(): HTMLFormElement | null {
    return this.query('#unlock-form');
  }

  /** The password field of the unlock form, `null` while it is closed. */
  get passwordInput(): HTMLInputElement | null {
    return this.query('#edit-password');
  }

  get confirmUnlockButton(): HTMLButtonElement {
    return this.get('#confirm-unlock');
  }

  get cancelUnlockButton(): HTMLButtonElement {
    return this.get('#cancel-unlock');
  }

  get unlockError(): string | undefined {
    return this.text('.unlock-error');
  }

  /** Opens the unlock form and enters the password without confirming it. */
  async enterPassword(password: string): Promise<void> {
    await this.click(this.unlockButton);
    this.get<HTMLInputElement>('#edit-password').value = password;
  }

  /** Waits until the check of the password is done. */
  async waitForPasswordCheck(): Promise<void> {
    await vi.waitFor(() => {
      if (this.query<HTMLButtonElement>('#confirm-unlock')?.disabled) throw Error('Still verifying');
    }, { timeout: 10000 });
  }

  /** Unlocks the editing, the card needs `PASSWORD_HASH`. */
  async unlock(password = PASSWORD): Promise<void> {
    await this.enterPassword(password);
    await this.click(this.confirmUnlockButton);
    await this.waitForPasswordCheck();
  }

  lock(): Promise<void> {
    return this.click(this.lockButton);
  }
}

/** The chart of the card. */
export class ChartView {
  constructor(private readonly view: ShadowView<HTMLElement>) {}

  get svg(): SVGSVGElement {
    return this.view.get('svg');
  }

  /** The `d` attribute of the curve. */
  get curvePath(): string {
    return this.view.get('path.curve').getAttribute('d') ?? '';
  }

  /** The steps of the curve path, like `M638,201.78`. */
  get curveSteps(): string[] {
    return this.curvePath.split(' ');
  }

  get clipPathId(): string {
    return this.view.get('clipPath').id;
  }

  /** The ID of the clip path the curve uses. */
  get curveClipPathId(): string {
    return (this.view.get('path.curve').getAttribute('clip-path') ?? '').slice('url(#'.length, -1);
  }

  /** The saved points. */
  get points(): SVGCircleElement[] {
    return this.view.queryAll('circle.point');
  }

  get pointLabels(): string[] {
    return this.view.texts('.point-label');
  }

  /** The `text-anchor` of the point labels. */
  get pointLabelAnchors(): (string | null)[] {
    return this.view.queryAll('.point-label').map(label => label.getAttribute('text-anchor'));
  }

  /** The tooltips of the saved points, like `P1: outdoor -20.0 °C · …`. */
  get pointTitles(): string[] {
    return this.titles('P');
  }

  /** The interpolated values between the points. */
  get samplePoints(): SVGCircleElement[] {
    return this.view.queryAll('.sample-point');
  }

  get sampleLabels(): string[] {
    return this.view.texts('.sample-label');
  }

  /** The outdoor temperatures of the labeled interpolated values. */
  get sampleOutdoors(): (string | undefined)[] {
    return this.view.queryAll('.sample-label').map(label => label.dataset.outdoor);
  }

  get sampleTitles(): string[] {
    return this.titles('Interpolated');
  }

  get flowLimitLabels(): string[] {
    return this.view.texts('.flow-limit-label');
  }

  get flowLimitLines(): SVGLineElement[] {
    return this.view.queryAll('.limit.flow-min, .limit.flow-max');
  }

  get heatingLimitLabels(): string[] {
    return this.view.texts('.limit-label');
  }

  /** The target flow of the controller, `null` without outdoor temperature. */
  get target(): SVGCircleElement | null {
    return this.view.query('circle.target');
  }

  get actual(): SVGCircleElement | null {
    return this.view.query('circle.actual');
  }

  get xAxisLabels(): string[] {
    return this.view.texts('g.axes text[y="365"]');
  }

  get yAxisLabels(): string[] {
    return this.view.texts('g.axes text[text-anchor="end"]');
  }

  /** All texts of the axes: the labels and at the end the two axis titles. */
  get axisTexts(): string[] {
    return this.view.texts('g.axes text');
  }

  get gridLines(): SVGLineElement[] {
    return this.view.queryAll('g.axes line');
  }

  private titles(start: string): string[] {
    return this.view.texts('g > title').filter(title => title.startsWith(start));
  }
}
