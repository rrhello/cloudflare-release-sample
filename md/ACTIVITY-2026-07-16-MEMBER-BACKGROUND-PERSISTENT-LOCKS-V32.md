# v32 — Member Background and Persistent Community Locks

## Changes

- Member-list page-level `.bg-communities-background` surfaces are transparent.
- Individual member cards retain a pale-white branded surface.
- Inactive member filter text uses dark sage green.
- Observed community access is stored in local storage with session-storage
  fallback, preserving lock state across routes, reloads, and browser tabs.
- A row's `data-rcc-locked` value is authoritative for lock visibility, so a
  stale HTML `hidden` attribute cannot suppress an unjoined community lock.
- Visible Join Group state continues to overwrite any older joined state.

## QA

Confirm the member page has no large white content background, cards remain
pale-white, inactive tabs use dark green, and unjoined locks remain visible
while navigating between community screens and after a reload.
