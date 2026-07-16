# GHL Advanced Custom JavaScript Loader — v26

Use the immutable v26 preview during QA and retain the v14 initial-paint CSS
guard.

```javascript
(function () {
  "use strict";
  var release = "v26";
  var releaseUrl =
    "https://PREVIEW_HOST.rccportal.pages.dev/releases/v26/release.js";
  var script;

  if (document.querySelector('script[data-rcc-release-loader="' + release + '"]')) return;
  document.documentElement.dataset.rccReady = "false";
  document.documentElement.classList.add("rcc-release-loading");
  script = document.createElement("script");
  script.src = releaseUrl;
  script.async = false;
  script.dataset.rccReleaseLoader = release;
  document.head.appendChild(script);
})();
```

Diagnostics:

```javascript
rccReleaseURL
rccDebugReport()
```
