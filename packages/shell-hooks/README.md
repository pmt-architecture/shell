# @-label-/shell-hooks

React hooks and context provider for the MFE shell framework. Thin layer over [`@-label-/shell-core`](https://github.com/pmt-architecture/fe-shell/tree/dev/packages/shell-core) for component-level integration.

## Installation

```sh
pnpm add @-label-/shell-hooks
```

Peer dependencies: `@-label-/shell-contracts >=1.0.0`, `react >=19`, `react-router >=7`, `zustand >=5`.

## What it exposes

### Provider

- `ShellApiProvider` — context provider. Pass the `ShellStore` (built with `createShellStore` from `shell-core`); the provider creates the `ShellApi` internally and wires `react-router`'s `useNavigate` into the navigation slice.

### Hooks

- `useShellApi()` — read the `ShellApi` from context. Throws if used outside `ShellApiProvider`.
- `useScopedShellApi(mfePrefix)` — returns a `ShellApi` with navigation scoped under `mfePrefix`. Inside the scope `navigate` only accepts relative paths; absolute paths are rejected with a console error (the host is the only entity that performs absolute navigation).
- `useShellStore(selector)` — `useStore`-style hook over the shell store. Selector is required.
- `useSlice<T>(name)` — subscribe to a dynamic slice's state by name.
- `useSliceEvent<TPayload>(descriptor, listener)` — subscribe to a slice event for the lifetime of the component.

### Store accessors

- `getShellStoreInstance()` / `setShellStoreInstance(store)` — escape hatch to read the store outside React (e.g. in module-scope code). The provider sets the instance automatically; `getShellStoreInstance` throws if called before mount. Prefer hooks inside components.

## Usage

### App bootstrap

```tsx
import { ShellApiProvider } from '@-label-/shell-hooks';
import { createShellStore } from '@-label-/shell-core';

const store = createShellStore({ /* ... */ });

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ShellApiProvider store={store}>
      <App />
    </ShellApiProvider>
  </BrowserRouter>,
);
```

The provider must be mounted under a `react-router` provider — it reads `useNavigate` internally.

### Inside a component

```tsx
import { useShellApi, useSlice, useSliceEvent } from '@-label-/shell-hooks';
import { FLEET_SLICE, FLEET_VEHICLE_SELECTED_EVENT, type FleetSlice } from '@-label-/fleet-contracts';

function VehiclePicker() {
  const api = useShellApi();
  const fleet = useSlice<FleetSlice>(FLEET_SLICE.name);

  useSliceEvent(FLEET_VEHICLE_SELECTED_EVENT, vehicle => {
    api.navigate(`/fleet/vehicles/${vehicle.id}`);
  });

  return <span>Selected: {fleet?.selectedVehicle?.plate ?? '—'}</span>;
}
```

### Scoped navigation per MFE

```tsx
import { useScopedShellApi } from '@-label-/shell-hooks';

function FleetMfe() {
  const api = useScopedShellApi('/fleet');
  // api.navigate('/vehicles') → host receives '/fleet/vehicles'
}
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
