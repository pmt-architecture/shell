# @-label-/shell-contracts

Foundation **type-only** package for the MFE shell framework. Defines the descriptors and the `ShellApi` surface shared across the host and every remote MFE.

Domain types (vehicles, rentals, maintenance, inventory) live in their own per-domain packages — see [`@-label-/fleet-contracts`](https://github.com/pmt-architecture/csr_mf/tree/dev/packages/fleet-contracts) and siblings.

## Contents

### Descriptor types

- `SliceDescriptor<T>` — `{ name; initialState: T }`. Registered once per emitter (fail-fast on duplicate).
- `EventDescriptor<TPayload>` — `{ sliceName; eventName }` plus a phantom `__payload` for compile-time inference. Always declared with an explicit type annotation (see [ADR-015](https://github.com/pmt-architecture/csr_mf/tree/dev/docs/adr/ADR-015-slice-events-fire-and-forget.md)).

### Right-bar types

- `RightBarRequest` — `{ panelId; payload? }`.
- `RightBarStackItem` — `{ panelId; payload }`.
- `RightBarState` — `{ isOpen; stack }`. Last item in `stack` is the visible panel.

### Shell-config types (consumed by the host loader)

- `MfeConfigEntry` — top-level MFE config (`name`, `entry`, `module`, optional `path`, `label`, `icon`, `children`, `panels`, `submenu`, `externalUrl`).
- `MfeChildRoute` — `{ path; module; entry?; tab? }`. `entry` lets a child load from a different remote.
- `MfePanelConfig` — `{ panelId; module; title; size? }`.
- `RemoteDefinition` — `{ remoteName; moduleName }`.

### `ShellApi` — exposed to remotes via props

Minimalist surface: scoped `navigate`, dynamic slice registry primitives (`registerSlice`, `unregisterSlice`, `getSliceState`, `setSliceState`, `onSliceChange`) and fire-and-forget events (`emitSliceEvent`, `onSliceEvent`). All cross-shell communication (panels, dialogs, etc.) flows through slice events defined in domain-specific contract packages — see ADR-016.

## Usage

```ts
import type { ShellApi, SliceDescriptor, EventDescriptor } from '@-label-/shell-contracts';

const COUNTER_SLICE: SliceDescriptor<{ value: number }> = {
  name: 'counter',
  initialState: { value: 0 },
};

const COUNTER_INCREMENTED_EVENT: EventDescriptor<number> = {
  sliceName: COUNTER_SLICE.name,
  eventName: 'incremented',
};
```

Type-only, no runtime — the package ships `.d.ts` only.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
