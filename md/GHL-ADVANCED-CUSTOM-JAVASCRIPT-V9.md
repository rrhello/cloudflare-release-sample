# GHL Advanced Custom JavaScript Loader — v9

## Why this loader changed

The default GHL layout can render before an external Cloudflare `release.js`
finishes downloading. A preloader created inside `release.js` cannot hide
anything that appears before that download completes.

The v9 loader therefore installs the minimal loading guard directly in GHL's
Advanced Custom JavaScript field before requesting the external release. The
external v9 loader adopts and removes the same guard after the customized
surface is ready.

## Immutable preview QA loader

Replace `PREVIEW_HOST` with the immutable Cloudflare deployment hostname. Do not
include `<script>` tags when pasting this into GHL.

```javascript
(function () {
  "use strict";

  var release = "v9";
  var releaseBase = "https://PREVIEW_HOST.rccportal.pages.dev/releases/v9/";
  var releaseUrl = releaseBase + "release.js";
  var root = document.documentElement;
  var style;
  var script;

  if (!document.getElementById("rcc-release-loading-style")) {
    style = document.createElement("style");
    style.id = "rcc-release-loading-style";
    style.textContent =
      "html.rcc-release-loading #app{visibility:hidden!important}" +
      "html.rcc-release-loading{overflow:hidden!important}" +
      "html.rcc-release-loading:before{position:fixed;inset:0;z-index:2147483646;content:'';background:#f4f4f4}" +
      "html.rcc-release-loading:after{position:fixed;top:50%;left:50%;z-index:2147483647;width:42px;height:42px;margin:-21px 0 0 -21px;content:'';border:4px solid #c8dfcb;border-top-color:#3f6644;border-radius:50%;animation:rcc-release-spin .72s linear infinite}" +
      "@keyframes rcc-release-spin{to{transform:rotate(360deg)}}" +
      "@media(prefers-reduced-motion:reduce){html.rcc-release-loading:after{animation-duration:1.5s}}";
    document.head.appendChild(style);
  }

  root.classList.add("rcc-release-loading");

  if (
    document.querySelector(
      'script[data-rcc-release-loader="' + release + '"]'
    )
  ) {
    return;
  }

  script = document.createElement("script");
  script.src = releaseUrl;
  script.async = false;
  script.dataset.rccReleaseLoader = release;

  script.onerror = function () {
    root.classList.remove("rcc-release-loading");
    console.error("RCC preview release failed:", releaseUrl);
  };

  document.head.appendChild(script);
})();
```

## Production loader

After v9 passes immutable-preview QA and is promoted to Cloudflare production,
use the same loader with:

```javascript
var releaseBase = "https://rccportal.pages.dev/releases/v9/";
```

Keep the v8 production loader backed up for rollback. If v9 fails after
activation, restore the v8 loader rather than editing served v9 assets.

## Flash-prevention QA

Use a new private window after saving the loader. Confirm:

1. the neutral RCC loading veil is the first portal UI shown;
2. the native GHL layout is never visible underneath it;
3. the veil disappears only after RCC styling and enhancements apply;
4. SPA navigation briefly shows the same veil;
5. failed asset loading removes the veil instead of trapping the page.
