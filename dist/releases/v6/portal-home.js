(function () {
  "use strict";

  document.dispatchEvent(
    new CustomEvent("rcc:surface-ready", {
      detail: { release: "v6", surface: "portal-home" }
    })
  );
})();
