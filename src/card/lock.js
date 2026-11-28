// Password lock of the editing: unlocks with the password and locks again after inactivity.
import { verifyPassword } from '../password.js';

/**
 * @typedef {import('../password.js').PasswordVerifier} PasswordVerifier
 * @typedef {import('../types.js').Translate} Translate
 */

/**
 * The `ha-form` with the password field, the card writes its values back.
 *
 * @typedef {HTMLElement & { data: Record<string, unknown> }} PasswordForm
 */

/**
 * The card that uses the lock.
 *
 * @typedef {object} LockHost
 * @property {Translate} t Translates the messages.
 * @property {(force: boolean) => void} render Redraws the card, `force` also while the user edits.
 * @property {() => PasswordForm | null} passwordForm The `ha-form` with the password of the unlock form.
 * @property {(message: string) => void} onLocked Discards the unsaved changes and shows the message.
 * @property {(message: string) => void} onUnlocked Shows the message.
 */

/** Milliseconds of a minute. */
const MINUTE = 60000;

export class EditLock {
  /**
   * @param {LockHost} host The card.
   */
  constructor(host) {
    this._host = host;
    /** @type {PasswordVerifier | null} */
    this._verifier = null;
    this._minutes = 0;
    /** Time until editing is unlocked, in milliseconds since the epoch. */
    this._unlockedUntil = 0;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this._timer = undefined;
    /** Counter that makes running password checks of an older state obsolete. */
    this._revision = 0;
    /** Whether the unlock form is shown. */
    this.formOpen = false;
    /** Whether a password check is running. */
    this.verifying = false;
    /** Error of the last password check, empty without error. */
    this.error = '';
  }

  /**
   * Sets the password and the auto-lock time of a new config and locks.
   *
   * @param {PasswordVerifier | null} verifier Verifier of the password, `null` without password.
   * @param {number} minutes Minutes until the card locks again after the last edit.
   */
  configure(verifier, minutes) {
    this._verifier = verifier;
    this._minutes = minutes;
    this._reset();
  }

  /** Whether the card has a password. */
  get enabled() {
    return !!this._verifier;
  }

  /** Minutes until the card locks again after the last edit. */
  get minutes() {
    return this._minutes;
  }

  /**
   * Whether the user can edit.
   *
   * @returns {boolean} `true` without password or while unlocked.
   */
  canEdit() {
    return !this._verifier || this._unlockedUntil > Date.now();
  }

  /** Restarts the auto-lock time after an edit. */
  touch() {
    if (!this._verifier || !this.canEdit()) return;
    this._unlockedUntil = Date.now() + this._minutes * MINUTE;
    clearTimeout(this._timer);
    this._timer = setTimeout(
      () => this.lock(this._host.t('Locked automatically after inactivity. Unsaved changes discarded.')),
      this._minutes * MINUTE,
    );
  }

  /**
   * Locks and discards the unsaved changes.
   *
   * @param {string} [message] Message for the user.
   */
  lock(message = this._host.t('Editing locked. Unsaved changes discarded.')) {
    this._reset();
    this._host.onLocked(message);
  }

  /** Shows the unlock form with the focus on the password. */
  openForm() {
    this.formOpen = true;
    this.error = '';
    this._host.render(true);
    this._focusPassword();
  }

  /**
   * Checks the password of the unlock form.
   *
   * @param {Event} [event] The submit, click or key event.
   * @returns {Promise<boolean> | undefined} The result of the check, `undefined` without check.
   */
  submit(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (this.verifying) return;
    // The form is shown, only its buttons and its field submit.
    const form = /** @type {PasswordForm} */ (this._host.passwordForm()), password = String(form.data.password ?? '');
    if (!password) {
      this.error = this._host.t('Please enter the password.');
      this._host.render(true);
      this._focusPassword();
      return;
    }
    form.data = {};
    return this.unlock(password);
  }

  /**
   * Unlocks with the password.
   *
   * @param {string} password The entered password.
   * @returns {Promise<boolean>} Whether the card is unlocked.
   */
  async unlock(password) {
    const revision = this._revision;
    const verifier = /** @type {PasswordVerifier} */ (this._verifier);
    this.verifying = true;
    this.error = '';
    this._host.render(true);
    try {
      const correct = await verifyPassword(password, verifier);
      if (revision !== this._revision) return false;
      if (!correct) {
        this.error = this._host.t('Incorrect password.');
        return false;
      }
      this._unlockedUntil = Date.now() + this._minutes * MINUTE;
      this.formOpen = false;
      this._host.onUnlocked(this._host.t('Editing unlocked.'));
      this.touch();
      return true;
    } catch {
      if (revision === this._revision) this.error = this._host.t('Password verification failed. Please try again.');
      return false;
    } finally {
      if (revision === this._revision) {
        this.verifying = false;
        this._host.render(true);
        if (this.formOpen) this._focusPassword();
      }
    }
  }

  /** Locks without message and makes running password checks obsolete. */
  _reset() {
    clearTimeout(this._timer);
    this._timer = undefined;
    this._unlockedUntil = 0;
    this._revision++;
    this.formOpen = false;
    this.verifying = false;
    this.error = '';
  }

  /** Focuses the password field after the redraw. */
  _focusPassword() {
    queueMicrotask(() => this._host.passwordForm()?.focus());
  }
}
