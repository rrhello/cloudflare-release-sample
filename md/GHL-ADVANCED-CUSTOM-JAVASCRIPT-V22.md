# GHL Advanced Custom JavaScript Loader — v22

Use the immutable v22 preview URL during QA. Keep the v14 initial-paint Custom
CSS guard in GHL.

```javascript
(function () {
  "use strict";

  var release = "v22";
  var releaseUrl =
    "https://PREVIEW_HOST.rccportal.pages.dev/releases/v22/release.js";
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

The loaded URL is available in either location:

```javascript
rccReleaseURL
rccDebugReport()
```
