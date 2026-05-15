# @-label-/shell-core

Zustand-based store factory and `ShellApi` implementation for the MFE shell framework. Bundler-agnostic, no React dependency — pair with [`@-label-/shell-hooks`](https://github.com/pmt-architecture/fe-shell/tree/dev/packages/shell-hooks) for React integration.

## Installation

```sh
pnpm add @-label-/shell-core
```

Peer dependencies: `@-label-/shell-contracts >=0.6.0`, `zustand >=5`.

## What it exposes

### Store

- `createShellStore(options)` — builds the Zustand store with the navigation and right-bar slices baked in plus the dynamic slice registry (`dynamicSlices`, `dynamicEvents`).
- `ShellStore` — type of the store returned by the factory.
- `onSliceChange(store, name, listener)` / `onSliceEvent(store, descriptor, listener)` — vanilla (non-React) subscribe helpers.

### `ShellApi` factory

- `createShellApi(store, mfePrefix?)` — produces a `ShellApi` instance bound to a store. When `mfePrefix` is provided, `navigate` is scoped to relative paths only — absolute paths are rejected with a console error so MFEs can only navigate within their own routes (the host is the only entity that performs absolute navigation).

### Built-in slices

- `navigationSlice` + `NavigationSliceState` — current location, scoped navigate. Source of truth lives outside but the slice mirrors it for subscribers.
- `rightBarSlice` + `RightBarSliceState` — `isOpen` + a panel `stack`. Last item is the visible panel; stack supports nested panels.

### Dynamic registry types

`DynamicSlicesState`, `EventEnvelope`, `SliceFactory`, plus re-exports of `EventDescriptor` and `SliceDescriptor` from `@-label-/shell-contracts`.

`EventEnvelope.__nonce` is generated fresh on every emit (via `crypto.randomUUID()`) so Zustand's `Object.is` equality always sees a different reference — guarantees listeners fire even when the same payload is emitted repeatedly.

## Usage

### Host bootstrap

```ts
import { createShellStore, createShellApi } from '@-label-/shell-core';

const store = createShellStore({ /* options */ });
const hostShellApi = createShellApi(store); // no prefix → can navigate absolutely

// Each remote gets its own scoped API:
const fleetApi = createShellApi(store, '/fleet'); // navigate('/x') is rejected; navigate('x') is allowed
```

### Vanilla subscription (no React)

```ts
import { onSliceEvent } from '@-label-/shell-core';
import { FLEET_VEHICLE_SELECTED_EVENT } from '@-label-/fleet-contracts';

const unsubscribe = onSliceEvent(store, FLEET_VEHICLE_SELECTED_EVENT, vehicle => {
  // ...
});
```

For React integration (hooks, context provider), use [`@-label-/shell-hooks`](https://github.com/pmt-architecture/fe-shell/tree/dev/packages/shell-hooks).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
