(function () {
  "use strict";

  document.dispatchEvent(
    new CustomEvent("rcc:surface-ready", {
      detail: { release: "v4", surface: "portal-home" }
    })
  );
})();
