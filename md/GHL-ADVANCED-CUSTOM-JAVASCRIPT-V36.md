# GHL Advanced Custom JavaScript Loader — v36

```javascript
(function () {
  "use strict";
  var release = "v36";
  var releaseUrl =
    "https://PREVIEW_HOST.rccportal.pages.dev/releases/v36/release.js?rcc=v36";
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
