---
'@-label-/contracts': minor
'@-label-/shell-core': minor
---

Remove the 5 right-bar panel methods from `ShellApi` — `openPanel`, `closePanel`, `updatePanelPayload`, `registerInPanel`, `unregisterInPanel`.

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
