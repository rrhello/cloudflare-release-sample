# GHL Advanced Custom JavaScript Loader — v28

Use the immutable v28 preview during QA and retain the v14 initial-paint CSS
guard.

```javascript
(function () {
  "use strict";
  var release = "v28";
  var releaseUrl =
    "https://PREVIEW_HOST.rccportal.pages.dev/releases/v28/release.js";
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
