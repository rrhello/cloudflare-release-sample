# v19 — Live Community Switcher State

## Production issue

The injected community rows captured GHL native button nodes when the list was
first built. GHL later replaced its native group rail, leaving the custom rows
connected to detached controls. A click could therefore fail to navigate, after
which URL-based active-state reconciliation returned the selection to
Accelerator.

Every custom row also displayed a lock regardless of live GHL access state.

## Changes

- A row resolves its matching native GHL control at click time using the live
  route slug first and normalized group name second.
- If the control is missing, the injected list is force-refreshed and resolution
  is attempted once more.
- The custom list stores a live signature containing group name, route slug,
  lock state, and native active state.
- GHL rail changes automatically rebuild the injected rows when that signature
  changes.
- Active state combines:
  - current `/communities/groups/{slug}` URL;
  - native `aria-current`, `aria-selected`, `data-state`, or active class;
  - the live `#group_info_name` heading.
- Lock state is shown only when the live control explicitly indicates disabled,
  locked, restricted, request-access, Join Group, or a lock-labelled element.
- Switcher clicks add trace entries for the resolved live group name, slug, and
  lock state.

## QA

Test Accelerator, RCC Sprint, and Test Sprint repeatedly. Confirm each click
changes the URL or live group heading, active styling follows the destination,
and lock icons match the native GHL access indicators.
