# GHL Advanced Custom JavaScript Loader — v30

Use the immutable v30 preview during QA and retain the v14 initial-paint CSS
guard.

```javascript
(function () {
  "use strict";
  var release = "v30";
  var releaseUrl =
    "https://PREVIEW_HOST.rccportal.pages.dev/releases/v30/release.js";
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
