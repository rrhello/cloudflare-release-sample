# v27 — Route-Specific Sidebar Supplement

## Preview finding

The Events and Leaderboard HTML captures contain three children inside GHL's
left sidebar:

1. the injected community list;
2. the hidden native 58px group rail;
3. a native `.flex-1` route-specific panel.

The third panel remained in the horizontal layout and was squeezed between the
custom sidebar and the main content.

## Fix

- The live route-specific panel is moved beneath the custom community rows.
- The native Vue element itself is retained; it is not cloned or replaced.
- Before rebuilding the custom list, the panel is temporarily preserved so
  removing an old injected list cannot remove GHL-owned content.
- Mutation reconciliation returns newly rendered Event or Leaderboard panels to
  the correct sidebar location.
- Full-height and 58px top-margin utilities are normalized for compact sidebar
  presentation.

## QA

Verify Events and Leaderboard routes:

- no narrow column appears between the sidebar and main content;
- the route-specific panel appears below Communities;
- main content retains its full usable width;
- navigating between routes does not duplicate or lose the sidebar panel.
