# RCC Cloudflare release assets

This repository deploys the versioned CSS and JavaScript used by RCC Portal Home and the RCC Community in GHL.

```text
Preview:    https://dev.rccportal.pages.dev
Production: https://rccportal.pages.dev
```

The first theme mapped to the real Portal Home and Community surfaces is `v4`.

Read [DEVELOPMENT.md](./DEVELOPMENT.md) before making adjustments. It contains the complete customization, release, preview, QA, promotion and rollback workflow.

## Release structure

Every release is a complete immutable bundle:

```text
dist/releases/v4/
├── release.js
├── shared.css
├── portal-home.css
├── portal-home.js
├── community.css
└── community.js
```

GHL loads only `release.js`. It loads shared assets, detects the active portal surface and loads the corresponding Home or Community assets.

## Cloudflare Pages configuration

```text
Production branch:   main
Preview branch:      dev
Build command:       leave blank
Build output folder: dist
```

The `dist/_headers` file gives versioned release assets immutable cache headers and cross-origin access.

## GHL Advanced Custom CSS

The GHL CSS editor should contain only a maintenance note:

```css
/* RCC CSS is loaded by the versioned Cloudflare release script. */
```

Do not paste the complete theme into GHL.

## GHL Advanced Custom JavaScript

Production loader example:

```javascript
(function () {
  "use strict";

  var release = "v4";
  var releaseUrl =
    "https://rccportal.pages.dev/releases/" + release + "/release.js";

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
    console.error("RCC external release failed:", releaseUrl);
  };
  document.head.appendChild(script);
})();
```

Do not surround this code with `<script>` tags when the GHL editor expects JavaScript only.

## Current release history

```text
v1  External asset loading proof
v2  SPA detection and lifecycle proof
v3  Clean loader without visual test markers
v4  First RCC theme mapped to real Portal Home and Community
```

Never edit a version after Cloudflare has served it. Start the next adjustment by copying the latest known-good release into a new version directory, then follow [DEVELOPMENT.md](./DEVELOPMENT.md).
