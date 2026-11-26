// Types of the parts of Home Assistant and of the card that the tests use.
import type { HassEntityState, HassEntityStates, HassServices, HassUser, MessageBase } from 'home-assistant-js-websocket';
import type { Mock } from 'vitest';

export type { HassEntityState, HassEntityStates };

/** The part of an entity state a test writes, `entityState()` adds the rest. */
export type EntityState = Pick<HassEntityState, 'state' | 'attributes'>;

/** Changed states by entity ID, for `withStates()`. */
export type StateChanges = Record<string, EntityState>;

/** Entry of `config/entity_registry/list`. */
export interface EntityRegistryEntry {
  entity_id?: string;
  unique_id?: string;
  platform: string;
  config_entry_id?: string | null;
  device_id?: string;
  disabled_by?: string | null;
}

/** Entry of `config/device_registry/list`. */
export interface DeviceRegistryEntry {
  id: string;
  name: string;
  name_by_user?: string;
}

/** Websocket message of `hass.callWS()`. */
export type WsMessage = MessageBase;

export type CallService = (domain: string, service: string, data: Record<string, unknown>) => Promise<unknown>;
export type CallWS = (message: WsMessage) => Promise<unknown>;

export interface HassLocale {
  language?: string;
  number_format?: string;
}

/**
 * Fake `hass` object with the parts of `HomeAssistant` the card and the editor read.
 *
 * `HomeAssistant` is a type of the Home Assistant frontend and no package, its tests also use a subset.
 */
export interface FakeHass {
  states: HassEntityStates;
  language: string;
  locale: HassLocale;
  user: Pick<HassUser, 'is_admin'>;
  themes: { darkMode: boolean };
  services: HassServices;
  callService: Mock<CallService>;
  callWS: Mock<CallWS>;
}

/** Point of a heating curve table. */
export interface CurvePoint {
  outdoor: number;
  flow: number;
}

/**
 * Card config as the user writes it in YAML.
 *
 * Loosely typed, because the tests also pass invalid values.
 */
export type CardConfig = Record<string, unknown>;

export interface HeatingCurveCard extends HTMLElement {
  hass: Partial<FakeHass>;
  setConfig(config: CardConfig): void;
  getCardSize(): number;
  getGridOptions(): Record<string, unknown>;
}

export interface HeatingCurveCardClass {
  new (): HeatingCurveCard;
  getStubConfig(): CardConfig;
  getConfigElement(): HTMLElement;
}

export interface HeatingCurveCardEditor extends HTMLElement {
  hass: Partial<FakeHass>;
  setConfig(config: CardConfig): void;
}

/** Entry of `window.customCards` for the card picker. */
export interface CustomCard {
  type: string;
  name?: string;
  description?: string;
  preview?: boolean;
}

declare global {
  interface HTMLElementTagNameMap {
    'keba-keenergy-heating-curve-card': HeatingCurveCard;
    'keba-keenergy-heating-curve-card-editor': HeatingCurveCardEditor;
  }

  interface Window {
    customCards?: CustomCard[];
  }
}
