# GHL Advanced Custom JavaScript Loader — v41

```javascript
(function () {
  "use strict";
  var release = "v41";
  var releaseUrl =
    "https://PREVIEW_HOST.rccportal.pages.dev/releases/v41/release.js?rcc=v41";
  var script;

  if (document.querySelector('script[data-rcc-release-loader="' + release + '"]')) return;
  document.documentElement.dataset.rccReady = "false";
  document.documentElement.classList.add("rcc-release-loading");
  script = document.createElement("script");
  script.src = releaseUrl;
  script.async = false;
  script.dataset.rccReleaseLoader = release;
  script.onerror = function () {
    document.documentElement.classList.remove("rcc-release-loading");
    document.documentElement.dataset.rccReady = "true";
  };
  document.head.appendChild(script);
})();
```
