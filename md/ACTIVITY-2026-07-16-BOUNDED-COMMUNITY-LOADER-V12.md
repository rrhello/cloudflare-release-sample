# v12 — Bounded Community Loader

## QA issue

v11 could remain on the sage loader because continual GHL mutations repeatedly
postponed the ready signal. The old Discover Channels card could also survive
briefly while GHL replaced the route DOM.

## Resolution

- The ready check no longer restarts on every mutation.
- A route waits at least 650 ms, looks for a post-navigation DOM mutation, and
  waits for a 160 ms quiet window.
- A hard 2400 ms release limit prevents the community loader from remaining
  indefinitely even when GHL continues mutating.
- The five-second loader fail-safe remains as a secondary recovery mechanism.
- The previous Discover card is marked stale and hidden immediately when
  navigation begins, then restored only after it is placed in the destination
  Communities list.
- The card is also forcibly hidden whenever the global loading veil is active.

## Manual QA

1. Install the full v12 immutable-preview loader.
2. Repeat navigation to `/communities/groups/accelerator/private-group` at least
   ten times, including hard refreshes and sidebar navigation.
3. Confirm the loader always releases, normally after the destination settles
   and no later than the bounded fallback.
4. Confirm no stale or squeezed Discover Channels card flashes between the
   sidebar and main content.
5. Confirm the final card remains below the community rows.
6. Regression-test muted unjoined tabs, hidden Chat, joined groups, Bento home,
   course routing, and mobile.

Do not merge `dev` into `main` until manual QA passes.
