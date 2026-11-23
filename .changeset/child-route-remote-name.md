---
'@-label-/shell-contracts': minor
---

Add optional `name` to `MfeChildRoute`: the federation name of the remote that a child `entry` override points to. Without it the host registers the child under the parent's name and resolves the module from the wrong container.
