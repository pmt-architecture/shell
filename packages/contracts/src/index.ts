/**
 * @-label-/contracts
 * Framework-level contracts shared across MFEs.
 *
 * Domain types (vehicles, rentals, maintenance, inventory) live in
 * their own per-domain packages:
 * - @-label-/fleet-contracts
 * - @-label-/rentals-contracts
 * - @-label-/maintenance-contracts
 * - @-label-/inventory-contracts
 */

export type { EventDescriptor, RightBarRequest, RightBarStackItem, RightBarState, ShellApi, SliceDescriptor } from './shell-api.types';

// ── MFE Config types ─────────────────────────────────────────

export interface MfeConfigEntry {
  name: string;
  path?: string;
  entry: string;
  module: string;
  label?: string;
  icon?: string;
  children?: MfeChildRoute[];
  panels?: MfePanelConfig[];
  submenu?: MfeConfigEntry[];
  externalUrl?: string;
}

export interface MfeChildRoute {
  path: string;
  module: string;
  /** Override parent entry — loads this child from a different remote. */
  entry?: string;
  tab?: {
    label: string;
    icon?: string;
  };
}

export interface MfePanelConfig {
  panelId: string;
  module: string;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface RemoteDefinition {
  remoteName: string;
  moduleName: string;
}
