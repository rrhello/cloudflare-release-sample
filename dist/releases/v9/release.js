(function () {
  "use strict";

  var RELEASE = "v9";
  var currentScript = document.currentScript;
  var base = currentScript && currentScript.src
    ? new URL("./", currentScript.src).href
    : "";
  var initializedSurface = "";
  var observer;
  var loadingTimer;

  function installLoadingVeil() {
    var style;

    if (!document.getElementById("rcc-release-loading-style")) {
      style = document.createElement("style");
      style.id = "rcc-release-loading-style";
      style.textContent =
        "html.rcc-release-loading #app{visibility:hidden!important}" +
        "html.rcc-release-loading{overflow:hidden!important}" +
        "html.rcc-release-loading:before{position:fixed;inset:0;z-index:2147483646;content:'';background:#f4f4f4}" +
        "html.rcc-release-loading:after{position:fixed;top:50%;left:50%;z-index:2147483647;width:42px;height:42px;margin:-21px 0 0 -21px;content:'';border:4px solid #c8dfcb;border-top-color:#3f6644;border-radius:50%;animation:rcc-release-spin .72s linear infinite}" +
        "@keyframes rcc-release-spin{to{transform:rotate(360deg)}}" +
        "@media(prefers-reduced-motion:reduce){html.rcc-release-loading:after{animation-duration:1.5s}}";
      document.head.appendChild(style);
    }

    document.documentElement.classList.add("rcc-release-loading");
  }

  function showLoadingVeil() {
    window.clearTimeout(loadingTimer);
    installLoadingVeil();
    loadingTimer = window.setTimeout(hideLoadingVeil, 5000);
  }

  function hideLoadingVeil() {
    window.clearTimeout(loadingTimer);
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        document.documentElement.classList.remove("rcc-release-loading");
      });
    });
  }

  if (!base) {
    console.error("RCC release loader could not determine its asset URL.");
    return;
  }

  function loadCSS(filename, callback) {
    var key = RELEASE + "/" + filename;
    var existing = document.querySelector('link[data-rcc-asset="' + key + '"]');

    if (existing) {
      if (callback) callback();
      return;
    }

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = base + filename;
    link.dataset.rccAsset = key;
    link.onload = function () {
      if (callback) callback();
    };
    link.onerror = function () {
      console.error("RCC stylesheet failed to load:", link.href);
      if (callback) callback();
    };
    document.head.appendChild(link);
  }

  function loadJS(filename) {
    var key = RELEASE + "/" + filename;

    if (document.querySelector('script[data-rcc-asset="' + key + '"]')) {
      return;
    }

    var script = document.createElement("script");
    script.src = base + filename;
    script.async = false;
    script.dataset.rccAsset = key;
    script.onerror = function () {
      console.error("RCC script failed to load:", script.src);
    };
    document.head.appendChild(script);
  }

  function detectSurface() {
    if (document.querySelector(".communities-preview")) {
      return "community";
    }

    if (
      document.querySelector(".bg-clientportal-liteBackground") ||
      document.querySelector(".nav-container")
    ) {
      return "portal-home";
    }

    return "";
  }

  function setActiveSurface(surface) {
    document.body.classList.remove(
      "rcc-portal-home-test",
      "rcc-community-test",
      "rcc-portal-home",
      "rcc-community"
    );

    document.body.classList.add("rcc-" + surface);
    document.documentElement.dataset.rccSurface = surface;

    document.dispatchEvent(
      new CustomEvent("rcc:surface-change", {
        detail: { release: RELEASE, surface: surface }
      })
    );
  }

  function initialize() {
    var surface = detectSurface();

    if (!surface || surface === initializedSurface) {
      return;
    }

    initializedSurface = surface;
    document.documentElement.dataset.rccRelease = RELEASE;
    setActiveSurface(surface);
    loadCSS(surface + ".css", function () {
      loadJS(surface + ".js");
    });
  }

  function patchHistoryLoading() {
    if (document.documentElement.dataset.rccLoadingHistoryPatched === "true") return;
    document.documentElement.dataset.rccLoadingHistoryPatched = "true";

    ["pushState", "replaceState"].forEach(function (method) {
      var original = window.history[method];
      window.history[method] = function () {
        var result;
        showLoadingVeil();
        result = original.apply(this, arguments);
        window.setTimeout(initialize, 0);
        window.setTimeout(hideLoadingVeil, 900);
        return result;
      };
    });

    window.addEventListener("popstate", function () {
      showLoadingVeil();
      window.setTimeout(initialize, 0);
      window.setTimeout(hideLoadingVeil, 900);
    });
  }

  showLoadingVeil();
  patchHistoryLoading();
  document.addEventListener("rcc:loading-start", showLoadingVeil);
  document.addEventListener("rcc:loading-end", hideLoadingVeil);
  document.addEventListener("rcc:surface-ready", hideLoadingVeil);
  loadCSS("shared.css");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

  observer = new MutationObserver(initialize);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.setTimeout(function () {
    if (!initializedSurface) {
      console.warn("RCC release " + RELEASE + " did not recognize this page.");
    }
  }, 10000);
})();
