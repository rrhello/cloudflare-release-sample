# v29 — Channel Sidebar, Featured Pins, and About Layout

## Changes

- The sidebar supplement uses the full column width with reduced top and side
  spacing.
- Channel list wrappers have their inherited horizontal padding removed.
- Each channel row spans the column and receives a subtle bottom separator.
- Featured pinned titles and descriptions use multi-line ellipsis so cards keep
  consistent heights.
- The `/about` route receives a dedicated layout state.
- `#group_info`, its cover/header, group name, details, and actions span the
  available main content width instead of remaining a narrow right sidebar.
- The About layout collapses to a stacked card on smaller screens.

## QA

Verify the compact full-width channel list, separators, equal-height pin cards,
and full-width responsive About group card.
