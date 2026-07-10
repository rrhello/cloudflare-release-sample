# RCC Cloudflare release sample

This directory is ready to deploy as a static Cloudflare Pages project. Release `v1` contains its matching shared CSS, surface-specific CSS, JavaScript and release loader.

## 1. Deploy to Cloudflare Pages

From this directory, authenticate Wrangler if necessary and deploy the `dist` directory:

```sh
npx wrangler pages deploy dist --project-name rcc-external-assets-test
```

Alternatively, connect the repository to Cloudflare Pages and configure:

```text
Build command:       leave blank
Build output folder: dist
Production branch:  main
```

After deployment, Cloudflare will provide an origin similar to:

```text
https://rcc-external-assets-test.pages.dev
```

Open the root URL first. The test page should show:

- A blue outline around the simulated Portal Home target.
- A badge reading `External release v1 · portal-home`.

Verify the release file directly:

```text
https://rcc-external-assets-test.pages.dev/releases/v1/release.js
```

Replace the example hostname below if Cloudflare assigns a different project hostname or you configure a custom asset domain.

## 2. GHL Advanced Custom CSS editor

For the recommended single-loader setup, the CSS editor does not need to import release files. The release JavaScript loads the matching CSS automatically.

Paste this comment into the GHL Advanced Custom CSS editor so future maintainers know where the CSS is managed:

```css
/*
 * RCC styles are loaded by the versioned Cloudflare release script configured
 * in Advanced Custom JavaScript. Do not paste the full theme into this editor.
 */
```

If GHL requires a CSS-based loader instead, use this optional variation and remove automatic `shared.css` loading from `release.js` to avoid duplicate requests:

```css
@import url("https://rcc-external-assets-test.pages.dev/releases/v1/shared.css");
```

The JavaScript loader remains responsible for `portal-home.css` or `community.css` because it detects which surface is active.

## 3. GHL Advanced Custom JavaScript editor

Paste this block into the GHL Advanced Custom JavaScript editor:

```javascript
(function () {
  "use strict";

  var releaseUrl =
    "https://rcc-external-assets-test.pages.dev/releases/v1/release.js";

  if (document.querySelector('script[data-rcc-release-loader="v1"]')) {
    return;
  }

  var script = document.createElement("script");
  script.src = releaseUrl;
  script.async = false;
  script.dataset.rccReleaseLoader = "v1";
  script.onerror = function () {
    console.error("RCC external release failed to load:", releaseUrl);
  };
  document.head.appendChild(script);
})();
```

Do not include `<script>` tags around this code when the editor expects JavaScript only.

## 4. Validate inside GHL

Test both surfaces:

1. Open Portal Home and confirm a blue test outline and `portal-home` badge.
2. Open the Community Portal and confirm a green outline and `community` badge.
3. Open browser developer tools and confirm there are no RCC loading errors.
4. In the Network panel, confirm `release.js`, `shared.css`, the surface CSS and the surface JS return HTTP 200.

The badge and outlines are deliberately conspicuous test behavior. Remove them when replacing the sample rules with the production theme.

## 5. Create release v2

Copy the complete `v1` directory to `v2`, then update the release constant inside `v2/release.js`:

```javascript
var RELEASE = "v2";
```

Update CSS and JavaScript only inside `v2`. Never modify a deployed `v1` directory because Cloudflare and browsers cache versioned release files as immutable.

After deploying and testing `v2`, change only these two values in the GHL JavaScript snippet:

```javascript
var releaseUrl =
  "https://rcc-external-assets-test.pages.dev/releases/v2/release.js";

script.dataset.rccReleaseLoader = "v2";
```

Rollback is the reverse: change `v2` back to `v1` in those two locations.

## 6. Production hardening

Before using this for the full RCC theme:

- Replace the test CSS with separated shared, Portal Home and Community rules.
- Replace the test JavaScript with idempotent surface-specific behavior.
- Use a custom asset domain if available.
- Record every release in a changelog and Git tag.
- Keep every published release directory immutable.
- Restrict production updates to a tested release from the production branch.

