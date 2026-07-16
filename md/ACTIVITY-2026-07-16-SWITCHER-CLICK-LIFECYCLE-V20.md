# v20 — Preserve Custom Switcher Click Lifecycle

## v19 trace finding

RCC Sprint and Test Sprint attempts recorded capture-phase
`navigation:intent`, but neither `community:group-control-click` nor
`community:group-control-missing` appeared. The URL stayed on Accelerator.

The capture-phase pointer-down handler started loading before the custom row's
click. Loading removed the Discover card, which triggered GHL/custom mutations.
The live-signature reconciliation could rebuild the group list before the
browser delivered `click`, detaching the original row and preventing its handler
from executing.

## Changes

- Custom `.rcc-community-group-row` elements are excluded from the global
  pointer-down loading selector.
- Their click handler now resolves the live GHL control first.
- The handler records the resolved control, then starts the veil, then clicks
  the live control.
- Native GHL group buttons and links retain capture-phase loading protection.
- Transient native active state is removed from the rebuild signature. Active
  styling is reconciled in place and no longer causes clickable rows to be
  replaced.

Expected trace for each custom-row click:

```text
community:group-control-click
→ event:rcc-loading-start
→ history:pushState
→ final group page
```
