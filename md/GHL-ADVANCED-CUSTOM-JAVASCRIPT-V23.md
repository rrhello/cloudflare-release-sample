# GHL Advanced Custom JavaScript Loader — v23

Use the immutable v23 preview URL during QA and keep the v14 initial-paint
Custom CSS guard.

```javascript
(function () {
  "use strict";

  var release = "v23";
  var releaseUrl =
    "https://PREVIEW_HOST.rccportal.pages.dev/releases/v23/release.js";
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
```
