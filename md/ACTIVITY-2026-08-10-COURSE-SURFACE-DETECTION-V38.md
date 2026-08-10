# v38 — Course Surface Detection

- Recognizes `/courses/products/<product-id>` routes as the Portal Home surface
  without depending on GoHighLevel's rendered navigation classes.
- Loads the existing course header CSS and Portal Home enhancements immediately
  on direct course-page visits.
- Preserves the v37 Portal Home and Community behavior for all other routes.

## QA

Open a course product URL directly and confirm `data-rcc-release` is `v38`,
`data-rcc-surface` is `portal-home`, and the v38 Portal Home assets load without
the `did not recognize this page` warning. Repeat Portal Home → Community →
Course navigation and verify the active surface follows each route.
