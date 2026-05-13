# @-label-/shell-hooks

## 0.2.6

### Patch Changes

- Updated dependencies [2cecc99]
  - @-label-/contracts@0.5.0
  - @-label-/shell-core@0.5.0

## 0.2.4

### Patch Changes

- Updated dependencies [10c1c41]
  - @-label-/shell-core@0.4.0

## 0.2.3

### Patch Changes

- Replace cross-MFE selections mailbox pattern with slice events (fire-and-forget).
  - `@-label-/contracts`: add `EventDescriptor<TPayload>` with phantom type for payload inference; remove `SelectionsState` and the four mailbox methods (`completeVehicleSelection`, `clearVehicleSelection`, `getVehicleSelection`, `onVehicleSelectionChange`) from `ShellApi`; add `emitSliceEvent` / `onSliceEvent` to `ShellApi`; add `FLEET_VEHICLE_SELECTED_EVENT` in `domains/fleet`.
  - `@-label-/shell-core`: add `dynamicEvents` bucket in parallel with `dynamicSlices`; nonce via `crypto.randomUUID()` bypasses `Object.is` so repeated payloads trigger listeners; `onSliceEvent` helper mirrors `onSliceChange`; `emitSliceEvent` error-logs and drops if slice not registered; `unregisterSlice` clears both state and events buckets when refCount reaches 0; remove `selectionsSlice`.
  - `@-label-/shell-hooks`: add `useSliceEvent(descriptor, listener)` hook — listener-only, does not cause the host component to re-render when events fire; compose with `useState` to expose the payload as UI state.

  See ADR-015 for the rationale and the state vs event API reference table.

- Updated dependencies
  - @-label-/shell-core@0.3.2

## 0.2.2

### Patch Changes

- 780a978: Migrate build from tsup to Vite library mode
- Updated dependencies [780a978]
  - @-label-/shell-core@0.3.1

## 0.2.1

### Patch Changes

- Updated dependencies
  - @-label-/shell-core@0.3.0

## 0.2.0

### Minor Changes

- ADR-010: Dynamic Slice Registry + MFE Contracts
  - @-label-/shell-core: new package — zustand/vanilla store factory with dynamic slice registry, ref-counting, pluggable host slices, createShellApi
  - @-label-/shell-hooks: new package — React bindings (useShellStore, ShellApiProvider, useShellApi, useSlice)
  - @-label-/contracts: added SliceDescriptor type, dynamic ShellApi methods, domain contracts (FleetSlice, RentalsSlice, MaintenanceSlice)

### Patch Changes

- Updated dependencies
  - @-label-/shell-core@0.2.0
