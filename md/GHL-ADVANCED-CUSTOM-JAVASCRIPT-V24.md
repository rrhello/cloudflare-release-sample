# GHL Advanced Custom JavaScript Loader — v24

Use the immutable v24 preview URL during QA and retain the v14 initial-paint
Custom CSS guard.

```javascript
(function () {
  "use strict";

  var release = "v24";
  var releaseUrl =
    "https://PREVIEW_HOST.rccportal.pages.dev/releases/v24/release.js";
  var root = document.documentElement;
  var script;

  if (document.querySelector('script[data-rcc-release-loader="' + release + '"]')) {
    return;
  }

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

Console verification:

```javascript
rccReleaseURL
rccDebugReport()
```
