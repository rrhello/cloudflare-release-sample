(function () {
  "use strict";

  var RELEASE = "v15";
  var currentScript = document.currentScript;
  var base = currentScript && currentScript.src
    ? new URL("./", currentScript.src).href
    : "";
  var initializedSurface = "";
  var observer;
  var loadingTimer;
  var traceStartedAt = performance.now();
  var traceEntries = [];
  var transitionId = 0;
  var activeTransition = 0;

  function trace(type, detail) {
    var entry = {
      ms: Math.round(performance.now() - traceStartedAt),
      type: type,
      transition: activeTransition,
      path: window.location.pathname,
      surface: document.documentElement.dataset.rccSurface || "",
      ready: document.documentElement.dataset.rccReady || "",
      loading: document.documentElement.classList.contains("rcc-release-loading"),
      detail: detail || {}
    };

    traceEntries.push(entry);
    if (traceEntries.length > 250) traceEntries.shift();
    if (window.console && console.debug) console.debug("[RCC TRACE]", entry);
  }

  window.rccTrace = trace;
  window.rccDebugReport = function () {
    var report = {
      release: RELEASE,
      url: window.location.href,
      readyState: document.readyState,
      ready: document.documentElement.dataset.rccReady || "",
      loading: document.documentElement.classList.contains("rcc-release-loading"),
      surface: document.documentElement.dataset.rccSurface || "",
      bodyClasses: document.body ? document.body.className : "",
      appPresent: Boolean(document.getElementById("app")),
      communitiesPresent: Boolean(document.querySelector(".communities-preview")),
      bentoPresent: Boolean(document.getElementById("rcc-bento-dashboard")),
      discoveryCardPresent: Boolean(document.getElementById("rcc-discovery-card")),
      assets: Array.prototype.map.call(
        document.querySelectorAll("[data-rcc-asset]"),
        function (node) { return node.getAttribute("data-rcc-asset"); }
      ),
      entries: traceEntries.slice()
    };

    console.log("RCC_DEBUG_REPORT_START");
    console.log(JSON.stringify(report, null, 2));
    console.log("RCC_DEBUG_REPORT_END");
    return report;
  };

  trace("release:boot", { release: RELEASE, base: base });

  function installLoadingVeil() {
    var style;

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

    document.documentElement.classList.add("rcc-release-loading");
  }

  function showLoadingVeil(reason) {
    window.clearTimeout(loadingTimer);
    transitionId += 1;
    activeTransition = transitionId;
    trace("loader:show", { reason: reason || "unspecified" });
    document.documentElement.dataset.rccReady = "false";
    installLoadingVeil();
    loadingTimer = window.setTimeout(function () {
      hideLoadingVeil("failsafe-5000ms");
    }, 5000);
  }

  function hideLoadingVeil(reason) {
    var hidingTransition = activeTransition;
    window.clearTimeout(loadingTimer);
    trace("loader:hide-request", {
      reason: reason || "unspecified",
      transition: hidingTransition
    });
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        document.documentElement.classList.remove("rcc-release-loading");
        document.documentElement.dataset.rccReady = "true";
        trace("loader:hidden", {
          reason: reason || "unspecified",
          transition: hidingTransition
        });
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
      trace("asset:css-loaded", { asset: key });
      if (callback) callback();
    };
    link.onerror = function () {
      trace("asset:css-error", { asset: key });
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
    script.onload = function () {
      trace("asset:js-loaded", { asset: key });
    };
    script.onerror = function () {
      trace("asset:js-error", { asset: key });
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
      if (!surface) trace("surface:not-detected");
      return;
    }

    trace("surface:change", { from: initializedSurface, to: surface });
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
        var routeChanged = false;
        var result;
        if (arguments.length > 2 && arguments[2] != null) {
          try {
            routeChanged = new URL(String(arguments[2]), window.location.href).href !== window.location.href;
          } catch (error) {
            routeChanged = false;
          }
        }
        trace("history:" + method, {
          routeChanged: routeChanged,
          target: arguments.length > 2 ? String(arguments[2]) : ""
        });
        if (routeChanged) showLoadingVeil("history:" + method);
        result = original.apply(this, arguments);
        window.setTimeout(initialize, 0);
        return result;
      };
    });

    window.addEventListener("popstate", function () {
      trace("history:popstate");
      showLoadingVeil("history:popstate");
      window.setTimeout(initialize, 0);
    });
  }

  function patchNavigationIntent() {
    function startNavigationFromIntent(event) {
      var target = event.target && event.target.closest
        ? event.target.closest(
          '.rcc-community-group-row, .rcc-source-group-button, .rcc-source-group-rail [role="button"], a[href*="/communities/groups/"]'
        )
        : null;

      if (!target || target.hasAttribute("aria-disabled")) return;
      if (event.type === "click" && event.detail !== 0) return;

      trace("navigation:intent", {
        event: event.type,
        target: target.id || target.className || target.tagName
      });
      document.dispatchEvent(new CustomEvent("rcc:loading-start"));
    }

    document.addEventListener("pointerdown", startNavigationFromIntent, true);
    document.addEventListener("click", startNavigationFromIntent, true);
  }

  showLoadingVeil("release:boot");
  patchHistoryLoading();
  patchNavigationIntent();
  document.addEventListener("rcc:loading-start", function (event) {
    trace("event:rcc-loading-start", event.detail || {});
    showLoadingVeil("event:rcc-loading-start");
  });
  document.addEventListener("rcc:loading-end", function (event) {
    trace("event:rcc-loading-end", event.detail || {});
    hideLoadingVeil("event:rcc-loading-end");
  });
  document.addEventListener("rcc:surface-ready", function (event) {
    trace("event:rcc-surface-ready", event.detail || {});
    hideLoadingVeil("event:rcc-surface-ready");
  });
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
