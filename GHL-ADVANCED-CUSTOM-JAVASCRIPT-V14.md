# GHL Advanced Custom JavaScript Loader — v14

Paste this into GHL Advanced Custom JavaScript without `<script>` tags. Replace
`PREVIEW_HOST` with the immutable QA host. Keep the companion initial-paint CSS
from `GHL-CUSTOM-CSS-INITIAL-PAINT-GUARD-V14.md`.

```javascript
(function () {
  "use strict";

  var release = "v14";
  var releaseBase = "https://PREVIEW_HOST.rccportal.pages.dev/releases/v14/";
  var releaseUrl = releaseBase + "release.js";
  var root = document.documentElement;
  var style;
  var script;

  root.dataset.rccReady = "false";

  if (!document.getElementById("rcc-release-loading-style")) {
    style = document.createElement("style");
    style.id = "rcc-release-loading-style";
    style.textContent =
      "html.rcc-release-loading #app{visibility:hidden!important}" +
      "html.rcc-release-loading #rcc-discovery-card{display:none!important}" +
      "html.rcc-release-loading{overflow:hidden!important}" +
      "html.rcc-release-loading:before{position:fixed;inset:0;z-index:2147483646;content:'';background:#f4f4f4}" +
      "html.rcc-release-loading:after{position:fixed;top:50%;left:50%;z-index:2147483647;width:42px;height:42px;margin:-21px 0 0 -21px;content:'';border:4px solid #c8dfcb;border-top-color:#3f6644;border-radius:50%;animation:rcc-release-spin .72s linear infinite}" +
      "@keyframes rcc-release-spin{to{transform:rotate(360deg)}}" +
      "@media(prefers-reduced-motion:reduce){html.rcc-release-loading:after{animation-duration:1.5s}}";
    document.head.appendChild(style);
  }

  root.classList.add("rcc-release-loading");
  if (document.querySelector('script[data-rcc-release-loader="' + release + '"]')) return;

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

After QA and production promotion:

```javascript
var releaseBase = "https://rccportal.pages.dev/releases/v14/";
```
