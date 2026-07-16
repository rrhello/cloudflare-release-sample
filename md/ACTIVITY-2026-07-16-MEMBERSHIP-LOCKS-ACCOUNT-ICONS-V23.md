# v23 — Membership Locks and Direct Account Icons

## Changes

- Community membership state is evaluated for every live GHL group control, not
  only the currently active group.
- Lock evidence is read from the control and its immediate GHL wrapper,
  including access/status attributes, lock elements, and Join Group text.
- Observed joined/locked state remains stored for the browser session, allowing
  inactive rows to keep their correct lock indicator.
- The Bento member card no longer has an Account options dropdown.
- Manage Account and Log Out are now always-visible icon buttons with accessible
  labels, native titles, tooltips, and hover/focus styling.

## QA

1. Open the communities sidebar with a mix of joined and unjoined groups.
2. Confirm every unjoined group displays its lock while inactive.
3. Switch between groups and confirm the lock does not depend on active state.
4. On the Bento dashboard, confirm both account icons are visible immediately.
5. Test their tooltip, hover, keyboard focus, Manage Account, and Log Out
   behavior.
