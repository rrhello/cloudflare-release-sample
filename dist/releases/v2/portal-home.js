(function () {
  "use strict";

  document.body.classList.add("rcc-portal-home-test");

  var target =
    document.querySelector(".bg-clientportal-liteBackground") ||
    document.querySelector(".nav-container");

  if (target) {
    target.setAttribute("data-rcc-test-target", "portal-home");
  }

  document.dispatchEvent(
    new CustomEvent("rcc:surface-ready", {
      detail: { release: "v1", surface: "portal-home" }
    })
  );
})();

