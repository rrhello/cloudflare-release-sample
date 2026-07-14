(function () {
  "use strict";

  document.dispatchEvent(
    new CustomEvent("rcc:surface-ready", {
      detail: { release: "v5", surface: "portal-home" }
    })
  );
})();
