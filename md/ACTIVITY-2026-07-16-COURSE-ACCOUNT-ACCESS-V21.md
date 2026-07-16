# v21 — Course Header, Member Actions, and Community State

## Requested refinements

- Make the customized top navigation span the full viewport on
  `/courses/products/IDPRODUCT`.
- In Bento mode, clicking the member card's account control reveals:
  - Manage Your Account
  - Log Out

## Implementation

- Course product routes receive a dedicated body state and a full-width,
  fixed navigation rule with no inherited maximum width, margin, or transform.
- The profile card remains valid semantic markup and now contains an accessible
  expandable account menu. Its actions hand control to GHL's live profile menu
  so authentication and account behavior remain native.
- Community lock state is learned from the live destination page and retained
  for the browser session. A visible Join Group state marks a community locked;
  a joined group home marks it unlocked.
- Custom community clicks suppress the duplicate global navigation intent and
  keep the loader active through GHL's provisional group `/home` transition.

## QA focus

1. Open a course product and confirm the header reaches both viewport edges.
2. Return to `/home`, use Bento mode, expand Account options, and test both
   member actions.
3. Visit joined and unjoined communities, return to the switcher, and confirm
   active and lock states reflect the pages actually observed.
4. Confirm one loader lifecycle is logged per custom community switch and the
   loader clears on the final route.
