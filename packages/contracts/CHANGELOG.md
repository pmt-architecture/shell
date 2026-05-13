# @-label-/contracts

## 0.5.0

### Minor Changes

- 2cecc99: Remove the 5 right-bar panel methods from `ShellApi` — `openPanel`, `closePanel`, `updatePanelPayload`, `registerInPanel`, `unregisterInPanel`.

  Panels are a host-specific UI concern: keeping them on the `ShellApi` coupled the framework contract to one form of presentation (right-bar with stack) and broke the symmetry "all cross-shell communication flows through slice events" established in ADR-015. With these removed, `ShellApi` becomes minimal: `navigate` + slice/event primitives only — reusable across any host.

  The `rightBarSlice` in `@-label-/shell-core` is **unchanged** — all 5 actions and the `panelRefs` field stay as the host's internal implementation. Consumers no longer reach them via `ShellApi`.

  Migration: host MFEs emit panel intents through events defined in a host-side contracts package (e.g. `@-label-/host-contracts` in the csr-mf POC):

  ```ts
  // Before
  shellApi.openPanel({ panelId: 'vehicle.quickView', payload: { id: 'v-001' } });
  shellApi.closePanel();

  // After (csr-mf example)
  shellApi.emitSliceEvent(PANEL_OPEN_REQUESTED_EVENT, { panelId: 'vehicle.quickView', payload: { id: 'v-001' } });
  shellApi.emitSliceEvent(PANEL_CLOSE_REQUESTED_EVENT, undefined);
  ```

  The host wires a module-level observer in its `shell-store` setup that translates the events back into `rightBarSlice` actions. See ADR-019 in csr-mf for the full design rationale.

## 0.4.0

### Minor Changes

- 5c5560f: Split domain contracts per-MFE.
  - New packages `@-label-/fleet-contracts`, `@-label-/rentals-contracts`, `@-label-/maintenance-contracts`, `@-label-/inventory-contracts` carry the domain-specific types and descriptors (e.g. `FleetSlice`, `FLEET_SLICE`, `FLEET_VEHICLE_SELECTED_EVENT`, `VehicleRef`, `VehicleStatus`).
  - Central `@-label-/contracts` now holds only framework-level types (`ShellApi`, `SliceDescriptor`, `EventDescriptor`, `RightBarRequest`, `RightBarStackItem`, `RightBarState`, `MfeConfigEntry`, `MfeChildRoute`, `MfePanelConfig`, `RemoteDefinition`).
  - Cross-MFE coupling is now explicit in each consumer's `package.json` (e.g. `apps/rentals` declares `@-label-/fleet-contracts` because it listens for `FLEET_VEHICLE_SELECTED_EVENT`). Dep graph becomes auditable.

  See ADR-010 for the rationale and BACKLOG entry for the context captured during the slice-events refactor.

## 0.3.4

### Patch Changes

- Replace cross-MFE selections mailbox pattern with slice events (fire-and-forget).
  - `@-label-/contracts`: add `EventDescriptor<TPayload>` with phantom type for payload inference; remove `SelectionsState` and the four mailbox methods (`completeVehicleSelection`, `clearVehicleSelection`, `getVehicleSelection`, `onVehicleSelectionChange`) from `ShellApi`; add `emitSliceEvent` / `onSliceEvent` to `ShellApi`; add `FLEET_VEHICLE_SELECTED_EVENT` in `domains/fleet`.
  - `@-label-/shell-core`: add `dynamicEvents` bucket in parallel with `dynamicSlices`; nonce via `crypto.randomUUID()` bypasses `Object.is` so repeated payloads trigger listeners; `onSliceEvent` helper mirrors `onSliceChange`; `emitSliceEvent` error-logs and drops if slice not registered; `unregisterSlice` clears both state and events buckets when refCount reaches 0; remove `selectionsSlice`.
  - `@-label-/shell-hooks`: add `useSliceEvent(descriptor, listener)` hook — listener-only, does not cause the host component to re-render when events fire; compose with `useState` to expose the payload as UI state.

  See ADR-015 for the rationale and the state vs event API reference table.

## 0.3.3

### Patch Changes

- 780a978: Migrate build from tsup to Vite library mode

## 0.3.2

### Patch Changes

- Add optional `entry` field to `MfeChildRoute` for cross-remote children

## 0.3.0

### Minor Changes

- Add panel ref-counting via registerInPanel/unregisterInPanel to ShellApi. Panels are automatically removed from the right-bar stack when all MFEs that registered interest unregister (ref-count reaches 0).

## 0.2.0

### Minor Changes

- ADR-010: Dynamic Slice Registry + MFE Contracts
  - @-label-/shell-core: new package — zustand/vanilla store factory with dynamic slice registry, ref-counting, pluggable host slices, createShellApi
  - @-label-/shell-hooks: new package — React bindings (useShellStore, ShellApiProvider, useShellApi, useSlice)
  - @-label-/contracts: added SliceDescriptor type, dynamic ShellApi methods, domain contracts (FleetSlice, RentalsSlice, MaintenanceSlice)

## 0.1.0

### Minor Changes

- Add ShellApi, domain types (VehicleRef, VehicleStatus, etc.), and panel config types for TODO-04 shell state management
