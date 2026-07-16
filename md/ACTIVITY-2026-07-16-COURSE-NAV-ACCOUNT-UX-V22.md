# v22 — Course Navigation and Account UX Refinements

## Changes

- Course product pages use the custom sage background.
- The full-width course header explicitly restores pointer interaction for
  links, buttons, and button-like controls.
- A fixed Back button is added to course product routes. It uses browser history
  when available and falls back to `/home`.
- Bento member actions include SVG icons, accessible labels, native titles,
  custom tooltips, and hover/focus feedback.
- The Bento/classic GHL toggle remains fixed at the bottom-right in both views.
- The release loader prints the complete loaded JavaScript URL to the console
  and exposes it as `window.rccReleaseURL`.

## QA

1. Open `/courses/products/IDPRODUCT`.
2. Confirm the sage background and full-width header.
3. Test every visible header menu item and the new Back button.
4. On `/home`, confirm the view toggle stays bottom-right in both modes.
5. Expand Account options and verify icons, tooltips, hover states, Manage Your
   Account, and Log Out.
6. In the console, run `rccReleaseURL` and confirm it ends in
   `/releases/v22/release.js`.
