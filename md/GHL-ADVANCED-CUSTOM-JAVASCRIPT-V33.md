# GHL Advanced Custom JavaScript Loader — v33

Use the immutable v33 preview during QA and retain the v14 initial-paint CSS
guard.

```javascript
(function () {
  "use strict";
  var release = "v33";
  var releaseUrl =
    "https://PREVIEW_HOST.rccportal.pages.dev/releases/v33/release.js";
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
