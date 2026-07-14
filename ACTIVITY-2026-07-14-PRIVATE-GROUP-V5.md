# Activity Recap: Private Group Theme to v5 Production

**Date:** July 14, 2026  
**Surface:** GHL Community  
**Release:** `v5`  
**Status:** Deployed and verified in production

## Purpose

This activity introduced a consistent RCC theme for the GHL private-group page shown to portal users who have not yet joined a group. The page needed to explain that the group is private, encourage the user to join, and visually match the rest of the RCC Portal Home and Community experience.

This document records what was changed, how the local prototype was converted into a versioned Cloudflare release, how the release was tested, and what should be repeated for similar activities.

## Starting point

The local reference page was:

```text
/Users/laptop-162/Projects/RR/MAC/community/sprint/portal-groups.html
```

The Cloudflare release repository was:

```text
/Users/laptop-162/Projects/RR/MAC/community/sprint/test-external/cloudflare-release-sample
```

The release baseline was `v4`, which already contained the established RCC Portal Home and Community theme.

The repository uses two broad GHL surfaces:

```text
Portal Home → portal-home.css and portal-home.js
Community   → community.css and community.js
```

`portal-groups.html` is a Community page state. It does not become a separate `portal-groups.css` or `portal-groups.js` asset.

## Local prototype work

### 1. Inspected the captured GHL page

The private-group markup exposed stable elements including:

```text
#joinGroup__btn
#container_group_about
#community-banner
#group_info
#info-container
#cover-image
#group_info_name
```

The page contained:

- A “Demo Group 1” header
- Private and Free badges
- A locked channel-discovery panel
- A group information card
- A Join Group button

### 2. Applied the RCC design system

The private-group prototype was aligned with the existing RCC Community theme:

- RCC sage colors and design tokens
- Consistent borders, cards, radii, typography, and spacing
- A sage private-group discovery panel
- A prominent Join Group action
- Hover and keyboard-focus treatment
- Responsive desktop, tablet, and mobile behavior

### 3. Matched the Accelerator Gate layout

The layout in `RCC_Community_Portal_Mockup.html` was reviewed, specifically its Accelerator Gate mode.

The private-group page was changed from a narrow 4/2 grid to a full-width gate-style flow:

- The “Demo Group 1” header card spans the entire content width.
- The group details and join card spans the entire row below it.
- Desktop uses a horizontal cover-and-content layout.
- Mobile collapses into a vertical card.

### 4. Removed local-preview redirection

The captured GHL application bootstrap script was removed from `portal-groups.html` because it reinitialized the live application and redirected the static local preview to:

```text
/communities/no-communities
```

The static captured DOM and RCC theme scripts remained available for local design review.

## Converting the prototype into a Cloudflare release

### Why the customization belongs to Community

The versioned loader detects only Portal Home or Community. A private group is a state inside the Community surface.

The final mapping was:

```text
portal-groups.html styles    → dist/releases/v5/community.css
private-page DOM detection  → dist/releases/v5/community.js
```

### Created the immutable candidate

The complete `v4` bundle was copied to `v5`:

```sh
cp -R dist/releases/v4 dist/releases/v5
```

The new bundle contained:

```text
dist/releases/v5/
├── release.js
├── shared.css
├── portal-home.css
├── portal-home.js
├── community.css
└── community.js
```

### Updated release identity

`dist/releases/v5/release.js` was updated to:

```javascript
var RELEASE = "v5";
```

The Portal Home lifecycle event was also updated to report `v5`.

### Added private-group page detection

The custom body class used by the prototype does not exist automatically in live GHL. `community.js` therefore detects the GHL private-group state:

```javascript
function updatePrivateGroupPage() {
  if (!document.body) return;

  var isPrivateGroup = Boolean(
    document.getElementById("joinGroup__btn") &&
    document.getElementById("container_group_about")
  );

  document.body.classList.toggle(
    "rcc-private-group-page",
    isPrivateGroup
  );
}
```

Detection was added to the existing Community enhancement lifecycle and to SPA history navigation handling.

This is important because the class must:

- Appear when GHL renders the private-group gate
- Remain correct after asynchronous DOM rendering
- Be removed after navigating to another Community page
- Avoid leaking private-page styles into public or joined groups

### Added scoped private-group CSS

All new rules were placed in:

```text
dist/releases/v5/community.css
```

The rules are scoped beneath:

```css
.rcc-private-group-page
```

This isolates the customization from other Community states.

## Local validation

The following checks passed:

```sh
node --check dist/releases/v5/release.js
node --check dist/releases/v5/portal-home.js
node --check dist/releases/v5/community.js
git diff --check
```

The complete `v5` bundle was reviewed against `v4`, and stale `v4` release identifiers were checked.

## Git and preview deployment

The key commits were:

```text
903a520 Add private community group theme v5
3c409a5 Add RCC release activity runbook
```

The candidate was pushed to the `dev` branch, which triggered Cloudflare Pages preview deployments.

Two immutable preview deployment hostnames were used during the activity:

```text
https://6b5c8bdb.rccportal.pages.dev
https://56588061.rccportal.pages.dev
```

The final approved preview loader used:

```text
https://56588061.rccportal.pages.dev/releases/v5/release.js
```

## Preview asset verification

All six assets returned HTTP 200 with correct content types:

```text
/releases/v5/release.js
/releases/v5/shared.css
/releases/v5/portal-home.css
/releases/v5/portal-home.js
/releases/v5/community.css
/releases/v5/community.js
```

The deployed preview assets were also compared byte-for-byte with the approved local `v5` files.

The preview headers correctly included:

```text
Access-Control-Allow-Origin: *
Cache-Control: public, max-age=31536000, immutable
X-Content-Type-Options: nosniff
```

## GHL preview QA

GHL Advanced Custom JavaScript was temporarily pointed to the immutable preview hostname.

Testing was performed in a fresh incognito session to avoid retained scripts, observers, and cached state from an older release.

### Required element checks

The browser console confirmed:

```javascript
document.getElementById("joinGroup__btn")
document.getElementById("container_group_about")
```

Both elements were present.

The combined diagnostic returned positive results for:

```text
release: v5
surface: community
joinButton: true
groupContainer: true
privateGroupClass: true
```

### Visual and navigation checks

The following passed:

- Full-width group header
- Full-width group details/join card
- Correct RCC private-group discovery styling
- Working Join Group button
- Horizontal desktop layout
- Vertical mobile layout
- Visible keyboard focus
- Public or joined groups did not retain `rcc-private-group-page`
- Portal Home and Community navigation continued working

## Production promotion

After preview QA passed, `dev` was merged into `main` and pushed to origin. Cloudflare Pages successfully deployed the production branch.

The repository ended with both branches at:

```text
main       3c409a5
dev        3c409a5
origin/main 3c409a5
origin/dev  3c409a5
```

## Important production verification finding

Before `dev` was merged into `main`, production asset URLs returned HTTP 200 but had:

```text
Content-Type: text/html
```

This was the Cloudflare fallback page, not the requested release asset.

Therefore, HTTP 200 alone is not sufficient. Always verify:

- Status code
- Content type
- File content or checksum

After production deployment, all six assets returned the correct JavaScript or CSS content types and matched the approved local candidate byte-for-byte.

## Final production assets

The production release is available at:

```text
https://rccportal.pages.dev/releases/v5/release.js
https://rccportal.pages.dev/releases/v5/shared.css
https://rccportal.pages.dev/releases/v5/portal-home.css
https://rccportal.pages.dev/releases/v5/portal-home.js
https://rccportal.pages.dev/releases/v5/community.css
https://rccportal.pages.dev/releases/v5/community.js
```

Production headers were confirmed to include CORS support and immutable caching.

## Final GHL production loader

The managed local source is:

```text
/Users/laptop-162/Projects/RR/MAC/community/sprint/custom-advanced.js
```

It was updated to load:

```text
https://rccportal.pages.dev/releases/v5/release.js
```

The loader uses:

```text
data-rcc-release-loader="v5"
```

and reports:

```text
RCC production release v5 loaded
```

## Lessons learned

### 1. Local page names do not define release surfaces

`portal-groups.html` is a local reference capture. Its production customization belongs to the Community surface because the versioned loader organizes assets by GHL surface, not by every route.

### 2. Live GHL needs semantic detection

Classes added manually to a captured HTML file do not automatically exist in live GHL. Use stable DOM elements to add a page-state class through the appropriate surface script.

### 3. Detection must remove state as well as add it

GHL uses SPA navigation. A page class must be toggled, not only added, so it does not remain active after navigating elsewhere.

### 4. Published release directories are immutable

Never modify `v5` after it has been served by Cloudflare. Any future correction must start as `v6`.

### 5. Use deployment-specific preview hostnames

The immutable deployment hostname avoids ambiguity caused by a moving `dev` alias or previously cached assets.

### 6. Verify content types, not only HTTP status

Cloudflare may return an HTML fallback with HTTP 200 for a missing release path. JavaScript must return a JavaScript content type and CSS must return `text/css`.

### 7. Test in a clean browser session

Old GHL tabs can retain mutation observers and release scripts. Close existing tabs and use incognito for candidate and production QA.

### 8. Keep GHL configuration minimal

GHL Advanced Custom CSS should contain only a maintenance note. The full theme remains in the versioned Cloudflare bundle.

## Reusable pattern for similar activities

For the next page-specific Community customization:

1. Capture or inspect the target GHL page.
2. Identify stable IDs, attributes, roles, or semantic text.
3. Prototype presentation locally.
4. Decide whether the page belongs to Portal Home or Community.
5. Create a new immutable release from the latest known-good version.
6. Move CSS into the correct surface stylesheet.
7. Add page-state detection to the surface script only when necessary.
8. Ensure detection works with initial render, mutations, and SPA navigation.
9. Update all release identifiers.
10. Run syntax and diff checks.
11. Push to `dev` and use an immutable Cloudflare preview hostname.
12. Verify status, content type, headers, and deployed content.
13. Test in GHL using a clean session.
14. Confirm page-specific classes disappear after navigation.
15. Merge `dev` into `main` only after preview approval.
16. Verify production assets again before changing GHL.
17. Update the GHL loader to the production origin.
18. Use the next version for every post-deployment correction.

## Related documentation

- `README.md` — release structure and loader overview
- `DEVELOPMENT.md` — complete development, QA, promotion, and rollback workflow
- `RELEASE-ACTIVITY-RUNBOOK.md` — reusable operational checklist
- `ACTIVITY-2026-07-14-PRIVATE-GROUP-V5.md` — this completed activity record
