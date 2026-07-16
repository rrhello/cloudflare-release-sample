# GHL Advanced Custom JavaScript Loader — v21

Paste this into GHL Advanced Custom JavaScript without `<script>` tags. Replace
`PREVIEW_HOST` with the immutable v21 QA host. Keep the v14 initial-paint Custom
CSS guard.

```javascript
(function () {
  "use strict";

  var release = "v21";
  var releaseBase = "https://PREVIEW_HOST.rccportal.pages.dev/releases/v21/";
  var releaseUrl = releaseBase + "release.js";
  var root = document.documentElement;
  var existing = document.querySelector(
    'script[data-rcc-release-loader="' + release + '"]'
  );
  var script;

  if (existing) return;

  root.dataset.rccReady = "false";
  root.classList.add("rcc-release-loading");

  script = document.createElement("script");
  script.src = releaseUrl;
  script.async = false;
  script.dataset.rccReleaseLoader = release;
  script.onerror = function () {
    root.classList.remove("rcc-release-loading");
    root.dataset.rccReady = "true";
    console.error("RCC preview release failed:", releaseUrl);
  };
  document.head.appendChild(script);
})();
```

Diagnostics:

```javascript
rccDebugReport()
```
