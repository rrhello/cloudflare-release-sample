# v39 — Course Content Above the Fold

- Fixes the course-product page appearing to have a full-screen spacer before
  the course content.
- Removes inherited viewport-height sizing from the course product root.
- Replaces the fixed 24rem Neo Classic course banner with a responsive,
  bounded banner so the lesson list begins inside the initial viewport.
- Uses route-scoped selectors; Portal Home and Community layouts are unchanged.

## QA

Open `/courses/products/<product-id>` at desktop, tablet, and mobile widths.
Confirm the course banner and the beginning of the course content are visible
without an initial page scroll. Confirm the banner image, title, and Start Course
button remain centered and usable. Then verify Portal Home and Community heroes
retain their existing sizing.
