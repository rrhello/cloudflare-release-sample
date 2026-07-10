(function () {
  "use strict";

  var RELEASE = "v2";
  var currentScript = document.currentScript;
  var base = currentScript && currentScript.src
    ? new URL("./", currentScript.src).href
    : "";
  var initializedSurface = "";
  var observer;

  if (!base) {
    console.error("RCC release loader could not determine its asset URL.");
    return;
  }

  function loadCSS(filename) {
    var key = RELEASE + "/" + filename;

    if (document.querySelector('link[data-rcc-asset="' + key + '"]')) {
      return;
    }

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = base + filename;
    link.dataset.rccAsset = key;
    link.onerror = function () {
      console.error("RCC stylesheet failed to load:", link.href);
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

  function addBadge(surface) {
    var badge = document.querySelector(".rcc-external-test-badge");

    if (!badge) {
      badge = document.createElement("div");
      badge.className = "rcc-external-test-badge";
      badge.setAttribute("role", "status");
      document.body.appendChild(badge);
    }

    badge.textContent = "External release " + RELEASE + " · " + surface;
    badge.dataset.rccRelease = RELEASE;
    badge.dataset.rccSurface = surface;
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
    var previousTargets = document.querySelectorAll("[data-rcc-test-target]");
    var index;
    var portalTarget;

    document.body.classList.remove(
      "rcc-portal-home-test",
      "rcc-community-test",
      "rcc-portal-home",
      "rcc-community"
    );

    for (index = 0; index < previousTargets.length; index += 1) {
      previousTargets[index].removeAttribute("data-rcc-test-target");
    }

    document.body.classList.add("rcc-" + surface);

    // Keep the conspicuous v2 test treatment until the real theme replaces it.
    document.body.classList.add("rcc-" + surface + "-test");
    document.documentElement.dataset.rccSurface = surface;

    if (surface === "portal-home") {
      portalTarget =
        document.querySelector(".bg-clientportal-liteBackground") ||
        document.querySelector(".nav-container");

      if (portalTarget) {
        portalTarget.setAttribute("data-rcc-test-target", "portal-home");
      }
    }

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
    loadCSS(surface + ".css");
    loadJS(surface + ".js");
    addBadge(surface);
  }

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
