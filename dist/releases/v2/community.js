(function () {
  "use strict";

  document.body.classList.add("rcc-community-test");

  document.dispatchEvent(
    new CustomEvent("rcc:surface-ready", {
      detail: { release: "v1", surface: "community" }
    })
  );
})();

