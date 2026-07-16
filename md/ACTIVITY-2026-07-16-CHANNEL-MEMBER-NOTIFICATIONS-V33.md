# v33 — Channel, Member Tab, and Notification Styling

## Scope

- Keep the injected channel list visually consistent across group home,
  members, about, events, leaderboard, and channel routes.
- Prevent member-filter styles from affecting the GHL app switcher,
  notification trigger, profile avatar, or other header controls.
- Keep inactive member filters readable with a dark branded font.
- Preserve the notification panel's native GHL layout and interactions while
  applying RCC surface, border, hover, and shadow colors.

## Root cause

The member-page selector matched every element whose ID began with
`pg-afcp-navbar__navigation-page-` and ended with `-btn`. GHL uses that same ID
pattern for member filters and several top-navigation controls. The member
inactive-state background, opacity, sizing, and text rules therefore leaked
into unrelated controls.

## Implementation

- Member selectors are restricted to direct button children of the
  `.group-members .scrollbar-hide` filter row.
- Inactive member filters use `#34443b` text over a neutral gray surface.
- Active filters use the dark sage surface and white text.
- App Switcher and Notifications List triggers receive isolated circular
  header-control styling.
- Notification content selectors only alter theme colors, borders, hover
  surfaces, and shadow. They do not change native positioning, dimensions,
  z-index, visibility, or pointer-event behavior.
- Channel menu items are keyed to their semantic menu role and
  `aria-label="Switch to … channel"` so the same treatment applies regardless
  of the active group subpage.

## QA

1. Open group home, members, about, events, leaderboard, and a channel route.
2. Confirm channel rows have equal width, padding, separators, hover state, and
   active dark-sage state on every route.
3. On members, confirm inactive filters use dark text and the selected filter
   uses white text on dark sage.
4. Open the app switcher and notification panel from the members route.
5. Confirm both triggers retain their circular header size and both panels open,
   close, scroll, and receive clicks normally.
6. Confirm notification rows retain the GHL structure with RCC pale-white,
   border, sage hover, and branded text colors.
