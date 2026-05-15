---
'@-label-/shell-contracts': major
'@-label-/shell-core': minor
'@-label-/shell-hooks': minor
---

Rename `@-label-/contracts` to `@-label-/shell-contracts`.

The package is being renamed for clarity and consistency with the csr-mf POC, where the framework-level contracts (`ShellApi`, `SliceDescriptor`, `EventDescriptor`, right-bar types, MFE config types) sit alongside several domain-specific `*-contracts` packages (`@-label-/fleet-contracts`, `@-label-/host-contracts`, etc.). The previous bare name `@-label-/contracts` was ambiguous — `@-label-/shell-contracts` makes it explicit that this package carries the shell framework's contracts.

**Migration:**

```diff
- import type { ShellApi, SliceDescriptor } from '@-label-/contracts';
+ import type { ShellApi, SliceDescriptor } from '@-label-/shell-contracts';
```

```diff
  "peerDependencies": {
-   "@-label-/contracts": ">=0.5.0"
+   "@-label-/shell-contracts": ">=0.6.0"
  }
```

`shell-core` and `shell-hooks` get a minor bump because their peer dependency name changed — same surface, different name.
