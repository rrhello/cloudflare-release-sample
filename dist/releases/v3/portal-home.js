(function () {
  "use strict";

  document.dispatchEvent(
    new CustomEvent("rcc:surface-ready", {
      detail: { release: "v3", surface: "portal-home" }
    })
  );
})();
