# RCC Portal Theme Development Guide

This repository manages the externally hosted CSS and JavaScript used by RCC Portal Home and the RCC Community inside GHL.

The current production-theme baseline is `v4`. All future adjustments must be created in a new release directory. Published release directories are immutable.

## 1. Architecture

Each release is a complete, self-contained bundle:

```text
dist/releases/v4/
├── release.js
├── shared.css
├── portal-home.css
├── portal-home.js
├── community.css
└── community.js
```

GHL loads only `release.js`. The loader:

1. Loads `shared.css` on every supported portal surface.
2. Detects Portal Home or Community from the rendered DOM.
3. Adds either `body.rcc-portal-home` or `body.rcc-community`.
4. Loads only the CSS and JavaScript for the detected surface.
5. Watches GHL SPA navigation and updates the active surface.

Cloudflare environments:

```text
Preview:    https://dev.rccportal.pages.dev
Production: https://rccportal.pages.dev
```

Cloudflare also creates an immutable deployment-specific preview hostname for every deployment. Use that hostname for final QA whenever possible.

## 2. Which file should be edited?

### `shared.css`

Use for rules shared by Portal Home and Community:

- RCC color variables and design tokens
- Font stacks and base typography
- Shared focus states
- Shared button or form behavior
- Utilities genuinely used by both surfaces

Shared rules should be scoped to one or both body classes:

```css
body.rcc-portal-home .example,
body.rcc-community .example {
  color: var(--rcc-charcoal);
}
```

Avoid unscoped selectors such as `.rounded-xl` or `.n-button` in this file. GHL uses generic utility and component classes throughout the application.

### `portal-home.css`

Use only for Portal Home presentation:

- Application navigation
- Portal identity and left sidebar
- Welcome content
- Recently Opened cards
- Shared Files panel
- Portal Home spacing and responsive layout

Scope every rule under:

```css
body.rcc-portal-home
```

Prefer stable classes and IDs visible in production markup:

```css
body.rcc-portal-home .nav-container { }
body.rcc-portal-home .bg-clientportal-liteBackground { }
body.rcc-portal-home #groups-view-all { }
body.rcc-portal-home #add-files { }
```

GHL utility classes containing generated dimensions can change. Use selectors such as `[class*="w-[24vw]"]` only when no stable semantic selector exists, and retest them after GHL platform updates.

### `portal-home.js`

Use only when CSS cannot implement a Portal Home requirement:

- Adding a semantic hook to generated markup
- Reorganizing a component
- Handling a Portal Home-only interaction

JavaScript must be idempotent. Running it more than once must not duplicate elements or event handlers:

```javascript
if (element.dataset.rccEnhanced === "true") {
  return;
}

element.dataset.rccEnhanced = "true";
```

Prefer CSS whenever possible.

### `community.css`

Use only for Community presentation:

- `.communities-preview`
- Community navigation and channel sidebar
- Group switcher
- Feed and pinned cards
- Community buttons
- Information sidebar and leaderboard
- Community responsive behavior

New rules should normally be scoped under:

```css
body.rcc-community .communities-preview
```

The current Community stylesheet contains the established mockup theme. Preserve working selectors and add narrowly targeted overrides near the relevant section.

### `community.js`

Use for Community DOM enhancements:

- Community group list
- Pinned-card restructuring
- Feed layout hooks
- Active group synchronization
- SPA route handling

The script already uses markers such as `data-rcc-enhanced` to avoid duplicate work. Preserve that pattern for new enhancements.

### `release.js`

This is infrastructure, not a styling file. Change it only for:

- The release number
- Surface detection
- Asset loading
- SPA lifecycle handling

Do not place visual customization logic directly in `release.js`.

## 3. Start a new adjustment release

Never edit a version already deployed to Cloudflare. Cloudflare serves `/releases/*` with one-year immutable browser caching.

Start from the latest known-good release. For example, to create `v5` from `v4`:

```sh
git switch dev
git pull --rebase
cp -R dist/releases/v4 dist/releases/v5
```

Update the release constant in `dist/releases/v5/release.js`:

```javascript
var RELEASE = "v5";
```

Also update any release value emitted by a surface script, if present:

```javascript
detail: { release: "v5", surface: "portal-home" }
```

Make all Home and Community adjustments inside `v5`. Do not edit `v4`.

## 4. Work locally before the first deployment

Run syntax checks after JavaScript changes:

```sh
node --check dist/releases/v5/release.js
node --check dist/releases/v5/portal-home.js
node --check dist/releases/v5/community.js
```

Check for whitespace and patch errors:

```sh
git diff --check
```

Serve the Pages output locally:

```sh
python3 -m http.server 4173 --directory dist
```

Open:

```text
http://127.0.0.1:4173/
```

The local page validates basic loading and Portal Home detection. It does not reproduce the full live GHL DOM, so GHL preview testing is still required.

Complete as much local work as possible before the first Cloudflare deployment of a version. Once a release URL has been served with immutable caching, corrections should use the next version number.

## 5. Commit and deploy a preview

Review the new release only:

```sh
git status --short
git diff -- dist/releases/v5
```

Commit and push to `dev`:

```sh
git add dist/releases/v5
git commit -m "Add RCC theme adjustments v5"
git push origin dev
```

Cloudflare automatically creates a preview deployment.

Verify all assets return HTTP 200:

```text
https://dev.rccportal.pages.dev/releases/v5/release.js
https://dev.rccportal.pages.dev/releases/v5/shared.css
https://dev.rccportal.pages.dev/releases/v5/portal-home.css
https://dev.rccportal.pages.dev/releases/v5/portal-home.js
https://dev.rccportal.pages.dev/releases/v5/community.css
https://dev.rccportal.pages.dev/releases/v5/community.js
```

For final QA, copy the deployment-specific hostname from Cloudflare Deployments:

```text
https://<deployment-hash>.rccportal.pages.dev/releases/v5/release.js
```

The hash hostname prevents a previous response cached under the moving `dev` alias from affecting the test.

## 6. Load a preview release in GHL

Prefer a duplicated GHL test page or controlled test portal. Preserve the current production loader before changing anything.

Paste this into GHL Advanced Custom JavaScript, replacing the URL and version:

```javascript
(function () {
  "use strict";

  var release = "v5";
  var releaseUrl =
    "https://<deployment-hash>.rccportal.pages.dev/releases/" +
    release +
    "/release.js";

  if (
    document.querySelector(
      'script[data-rcc-release-loader="' + release + '"]'
    )
  ) {
    return;
  }

  var script = document.createElement("script");
  script.src = releaseUrl;
  script.async = false;
  script.dataset.rccReleaseLoader = release;
  script.onerror = function () {
    console.error("RCC preview release failed:", releaseUrl);
  };
  document.head.appendChild(script);
})();
```

The Advanced Custom CSS editor should contain only a maintenance note:

```css
/* RCC CSS is loaded by the versioned Cloudflare release script. */
```

Do not paste the complete theme into GHL.

After switching releases, close existing portal tabs and start a new incognito session. A previously loaded release can leave an active `MutationObserver` in an existing document.

## 7. Required QA checklist

Test this navigation sequence at least twice:

```text
Portal Home → Community → Portal Home → Community
```

### General

- [ ] No browser console errors
- [ ] `data-rcc-release` reports the candidate version
- [ ] `data-rcc-surface` follows navigation
- [ ] No test badges or outlines
- [ ] No duplicate CSS or JavaScript assets
- [ ] Keyboard focus remains visible
- [ ] GHL menus, buttons and modals still function
- [ ] Desktop and mobile layouts remain usable

Check runtime state:

```javascript
document.documentElement.dataset.rccRelease
document.documentElement.dataset.rccSurface
```

List loaded assets:

```javascript
Array.from(
  document.querySelectorAll("[data-rcc-asset]")
).map(function (element) {
  return element.href || element.src;
});
```

### Portal Home

- [ ] Dark top navigation and icons are legible
- [ ] Portal identity and sidebar remain aligned
- [ ] Welcome heading fits without clipping
- [ ] Recently Opened cards display correctly
- [ ] Shared Files empty and populated states work
- [ ] Sidebar and content behave at tablet/mobile widths

### Community

- [ ] Community group switcher works
- [ ] Active group follows the current route
- [ ] Channel navigation works
- [ ] Pinned cards render correctly with and without media
- [ ] Feed cards and right sidebar align correctly
- [ ] Join, course and profile buttons work
- [ ] Community mobile layout remains usable

## 8. Handling QA corrections

If the candidate has already been deployed with immutable headers, create the next version instead of overwriting it:

```sh
cp -R dist/releases/v5 dist/releases/v6
```

Set `RELEASE` to `v6`, apply the correction there, and repeat preview QA.

This may produce several candidate versions. That is expected and is safer than debugging stale browser caches.

## 9. Promote an approved release

After the exact preview deployment passes QA:

```sh
git switch main
git pull --rebase
git merge dev
git push origin main
```

Wait for the production Cloudflare deployment and verify the approved release at:

```text
https://rccportal.pages.dev/releases/v5/release.js
```

Update GHL to the production origin:

```javascript
var release = "v5";
var releaseUrl =
  "https://rccportal.pages.dev/releases/" + release + "/release.js";
```

Open a new incognito session and repeat the Portal Home and Community smoke test.

## 10. Rollback

Do not delete or modify the broken release during an incident. Change the GHL loader back to the last known-good production version:

```javascript
var release = "v4";
```

Because old release directories remain deployed, rollback does not require a Cloudflare deployment.

After rollback:

1. Record the affected release and symptoms.
2. Create a new version from the last known-good release.
3. Apply the correction forward.
4. Repeat preview QA and promotion.

## 11. Development rules

1. Never modify a release after Cloudflare has served it.
2. Never reuse a version number.
3. Never point production GHL at `dev.rccportal.pages.dev`.
4. Keep Portal Home selectors under `body.rcc-portal-home`.
5. Keep Community selectors under `body.rcc-community` or `.communities-preview`.
6. Keep JavaScript idempotent and safe under SPA navigation.
7. Prefer CSS over DOM manipulation.
8. Test actual GHL markup before promotion.
9. Promote the exact commit and deployment that passed QA.
10. Keep the previous production release available for immediate rollback.

## 12. Release history baseline

```text
v1  External asset loading proof
v2  SPA detection and lifecycle proof
v3  Clean loader without visual test markers
v4  First RCC theme mapped to real Portal Home and Community
```

Continue this history in commit messages or add a `CHANGELOG.md` as customizations progress.
