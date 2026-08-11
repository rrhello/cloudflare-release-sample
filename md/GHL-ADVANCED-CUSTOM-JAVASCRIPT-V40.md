# GHL Advanced Custom JavaScript Loader — v40

```javascript
(function () {
  "use strict";
  var release = "v40";
  var releaseUrl =
    "https://PREVIEW_HOST.rccportal.pages.dev/releases/v40/release.js?rcc=v40";
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
