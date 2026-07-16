# v24 — Initial Locks and Community Interaction Recovery

## Changes

- Unknown community membership now starts conservatively as locked while the
  GHL list is loading.
- A visibly rendered Join Group control confirms locked access.
- A rendered group navigation without a visible Join Group control confirms
  joined access and clears the lock for that group.
- Private/unjoined mode is based on visibility, not merely the presence of a
  stale Join Group node retained by the SPA.
- Joined group navigation has disabled attributes, muted classes, and
  pointer-event restrictions removed during every reconciliation.
- Community readiness now defensively removes the release loading class before
  dispatching the normal loading-end events, preventing a stale full-screen
  loader layer from intercepting tabs, posts, or other content.
- The Bento Manage Account icon is replaced with a compact `Account` text
  button. Log Out remains an icon button.

## QA

1. Load the community list from a fresh tab and confirm locks appear immediately
   on groups whose membership has not yet been confirmed.
2. Visit joined groups and confirm their locks clear and remain clear.
3. Visit an unjoined group and confirm its lock remains.
4. In a joined group, click Discussion, Learning, Events, posts, reactions, and
   other visible content.
5. Confirm no transparent or loading layer intercepts interaction after the
   page becomes visible.
6. Confirm the Bento member card shows `Account` plus the Log Out icon.
