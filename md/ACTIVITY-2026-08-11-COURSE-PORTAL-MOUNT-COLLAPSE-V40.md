# v40 — Collapse Empty Portal Mount on Course Routes

- Fixes the course beginning exactly one viewport below the top of the page.
- Collapses GHL's unused `#membership-preview-portal` mount only on
  `/courses/products/<product-id>` routes.
- Preserves the v39 course banner sizing and all existing Portal Home and
  Community behavior.

## Root cause

The production v39 snapshot contains two sibling mounts inside `#app-container`:
the empty `#membership-preview-portal` and the populated `.route-container`.
GHL gives the empty portal mount a viewport-height minimum, positioning the
course route one full screen below it.

## QA

Open a course product URL at scroll position zero and confirm the course header
and banner are visible immediately. In the console, verify the portal mount has
zero height and the route container begins at the top of the page:

```javascript
document.querySelector("#membership-preview-portal").getBoundingClientRect().height
document.querySelector(".route-container").getBoundingClientRect().top
```

Both values should be `0` (allowing normal sub-pixel rounding). Navigate to
Portal Home and Community and confirm their mounts and layouts remain visible.
