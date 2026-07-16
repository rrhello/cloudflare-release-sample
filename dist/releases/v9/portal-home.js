(function () {
  "use strict";

  var RELEASE = "v9";
  var STORAGE_KEY = "rcc:portal-dashboard-theme";
  var GRID_THEME = "grid";
  var DEFAULT_THEME = "default";
  var ROOT_ID = "rcc-bento-dashboard";
  var TOGGLE_ID = "rcc-dashboard-theme-toggle";
  var scheduled = false;
  var observer;
  var navigationPending = false;
  var lastPathname = window.location.pathname;

  function getStoredTheme() {
    try {
      var storedTheme = window.localStorage.getItem(STORAGE_KEY);
      return storedTheme === DEFAULT_THEME ? DEFAULT_THEME : GRID_THEME;
    } catch (error) {
      return GRID_THEME;
    }
  }

  function storeTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn("RCC dashboard theme preference could not be saved.");
    }
  }

  function isPortalHomeAvailable() {
    var pathname = window.location.pathname.replace(/\/+$/, "") || "/";
    return Boolean(
      document.body &&
      !navigationPending &&
      pathname === "/home" &&
      !document.querySelector(".communities-preview") &&
      (document.querySelector(".bg-clientportal-liteBackground") ||
        document.querySelector(".nav-container"))
    );
  }

  function createElement(tag, className, text) {
    var element = document.createElement(tag);

    if (className) element.className = className;
    if (typeof text === "string") element.textContent = text;

    return element;
  }

  function setText(element, value) {
    var nextValue = value || "";
    if (element && element.textContent !== nextValue) {
      element.textContent = nextValue;
    }
  }

  function queryText(selector, fallback) {
    var element = document.querySelector(selector);
    var value = element && element.textContent
      ? element.textContent.trim()
      : "";
    return value || fallback;
  }

  function queryTextWithin(root, selector, fallback) {
    var element = root ? root.querySelector(selector) : null;
    var value = element && element.textContent
      ? element.textContent.trim()
      : "";
    return value || fallback;
  }

  function findCardByHeading(headingText) {
    var headings = document.querySelectorAll(".hl-text-lg-medium");
    var index;

    for (index = 0; index < headings.length; index += 1) {
      if (headings[index].textContent.trim() === headingText) {
        return headings[index].closest(".rounded-xl") || headings[index].parentElement;
      }
    }

    return null;
  }

  function findNativeControl(action) {
    var notificationBadge;

    if (action === "profile") return document.getElementById("btn-profile");
    if (action === "course") return document.getElementById("courses-btn");
    if (action === "files") return document.getElementById("add-files");
    if (action === "community") {
      return document.querySelector('[aria-label="Join a Group"]');
    }
    if (action === "notifications") {
      notificationBadge = document.querySelector(".nav-container .n-badge");
      return notificationBadge
        ? notificationBadge.closest("button, [role='button'], [class*='cursor-pointer']")
        : null;
    }

    return null;
  }

  function activateNativeControl(action) {
    var control = findNativeControl(action);

    if (!control) return;

    if (action === "course" || action === "community") {
      navigationPending = true;
      document.body.classList.remove("rcc-grid-theme");
      if (document.getElementById(ROOT_ID)) {
        document.getElementById(ROOT_ID).hidden = true;
      }
      document.dispatchEvent(new CustomEvent("rcc:loading-start"));
    }

    control.click();

    if (navigationPending) {
      window.setTimeout(function () {
        if (window.location.pathname === "/home") {
          navigationPending = false;
          scheduleReconcile();
          document.dispatchEvent(new CustomEvent("rcc:loading-end"));
        }
      }, 1500);
    }
  }

  function createCard(key, title, eyebrow, action) {
    var card = createElement(
      action ? "button" : "section",
      "rcc-bento-card rcc-bento-card--" + key
    );
    var header = createElement("div", "rcc-bento-card__header");
    var label = createElement("span", "rcc-bento-card__eyebrow", eyebrow);
    var heading = createElement("h2", "rcc-bento-card__title", title);
    var content = createElement("div", "rcc-bento-card__content");

    card.dataset.rccCard = key;
    header.appendChild(label);
    header.appendChild(heading);
    card.appendChild(header);
    card.appendChild(content);

    if (action) {
      card.type = "button";
      card.dataset.rccAction = action;
      card.setAttribute("aria-label", title);
    }

    return card;
  }

  function addMetric(card, value, label) {
    var content = card.querySelector(".rcc-bento-card__content");
    content.appendChild(createElement("strong", "rcc-bento-card__metric", value));
    content.appendChild(createElement("span", "rcc-bento-card__caption", label));
  }

  function buildDashboard() {
    var root = createElement("main", "rcc-bento-dashboard");
    var intro = createElement("header", "rcc-bento-intro");
    var grid = createElement("div", "rcc-bento-grid");
    var portalCard = createCard("portal", "RCC Portal", "Workspace");
    var profileCard = createCard("profile", "Your profile", "Member", "profile");
    var courseCard = createCard("course", "Active course", "Learning", "course");
    var communityCard = createCard("community", "Community", "Connect", "community");
    var filesCard = createCard("files", "Vault & files", "Resources", "files");
    var notificationsCard = createCard(
      "notifications",
      "Notifications",
      "Updates",
      "notifications"
    );
    var logo = createElement("img", "rcc-bento-card__logo");
    var avatar = createElement("img", "rcc-bento-card__avatar");
    var courseContent = courseCard.querySelector(".rcc-bento-card__content");
    var progress = createElement("div", "rcc-bento-progress");
    var progressText = createElement("strong", "rcc-bento-progress__value", "0%");
    var progressLabel = createElement(
      "span",
      "rcc-bento-card__caption",
      "Course completion"
    );

    root.id = ROOT_ID;
    root.setAttribute("aria-label", "RCC grid dashboard");
    intro.appendChild(createElement("p", "rcc-bento-intro__eyebrow", "RCC Community Portal"));
    intro.appendChild(createElement("h1", "rcc-bento-intro__title", "Your dashboard"));
    intro.appendChild(
      createElement("p", "rcc-bento-intro__copy", "Continue learning, connect, and find your resources.")
    );

    logo.alt = "";
    logo.hidden = true;
    portalCard.querySelector(".rcc-bento-card__content").appendChild(logo);
    addMetric(portalCard, "RCC", "Residential Care Collective");

    avatar.alt = "";
    avatar.hidden = true;
    profileCard.querySelector(".rcc-bento-card__content").appendChild(avatar);
    addMetric(profileCard, "Member", "Open account menu");

    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", "0");
    progress.appendChild(progressText);
    courseContent.appendChild(progress);
    courseContent.appendChild(progressLabel);

    addMetric(communityCard, "Join in", "Open your community groups");
    addMetric(filesCard, "Resources", "Open shared files and uploads");
    addMetric(notificationsCard, "0", "Unread updates");

    grid.appendChild(portalCard);
    grid.appendChild(profileCard);
    grid.appendChild(courseCard);
    grid.appendChild(communityCard);
    grid.appendChild(filesCard);
    grid.appendChild(notificationsCard);
    root.appendChild(intro);
    root.appendChild(grid);

    root.addEventListener("click", function (event) {
      var actionCard = event.target.closest("[data-rcc-action]");
      if (actionCard) activateNativeControl(actionCard.dataset.rccAction);
    });

    document.body.appendChild(root);
    return root;
  }

  function buildToggle() {
    var wrapper = createElement("div", "rcc-theme-toggle");
    var button = createElement("button", "rcc-theme-toggle__button");
    var label = createElement("span", "rcc-theme-toggle__label", "Bento dashboard");
    var track = createElement("span", "rcc-theme-toggle__track");

    wrapper.id = TOGGLE_ID;
    button.type = "button";
    button.setAttribute("aria-label", "Use Bento dashboard view");
    button.setAttribute("aria-pressed", "false");
    track.setAttribute("aria-hidden", "true");
    button.appendChild(label);
    button.appendChild(track);
    wrapper.appendChild(button);

    button.addEventListener("click", function () {
      var nextTheme = document.body.classList.contains("rcc-grid-theme")
        ? DEFAULT_THEME
        : GRID_THEME;
      storeTheme(nextTheme);
      applyTheme(nextTheme);
    });

    document.body.appendChild(wrapper);
    return wrapper;
  }

  function applyTheme(theme) {
    var useGrid = theme === GRID_THEME && isPortalHomeAvailable();
    var toggle = document.querySelector("#" + TOGGLE_ID + " button");

    document.body.classList.toggle("rcc-grid-theme", useGrid);
    document.body.classList.toggle("rcc-default-theme", !useGrid);

    if (toggle) {
      toggle.setAttribute("aria-pressed", String(useGrid));
      toggle.setAttribute(
        "aria-label",
        useGrid ? "Use classic GHL dashboard view" : "Use Bento dashboard view"
      );
      setText(
        toggle.querySelector(".rcc-theme-toggle__label"),
        useGrid ? "Classic GHL view" : "Bento dashboard"
      );
    }
  }

  function updateDashboard(root) {
    var sidebarImage = document.querySelector('[alt="Portal Image"] img');
    var profileImage = document.querySelector('#btn-profile img');
    var greeting = queryText(".py-6 > .hl-text-md-normal", "Member").replace(/^Hi,\s*/i, "");
    var portalName = queryText('[class*="w-[24vw]"] .hl-display-sm-medium', "RCC Portal");
    var nativeProgress = document.querySelector('.progress [role="progressbar"]');
    var progressValue = nativeProgress
      ? Number(nativeProgress.getAttribute("aria-valuenow")) || 0
      : 0;
    var courseCard = findCardByHeading("Course Progress");
    var courseName = queryTextWithin(
      courseCard,
      ".text-clientportal-tertiary",
      "Course completion"
    ).replace(/^['\"]|['\"]$/g, "");
    var filesCard = findCardByHeading("Shared Files");
    var filesText = queryTextWithin(
      filesCard,
      ".hl-text-xs-regular",
      "Open your resources"
    );
    var badge = document.querySelector(".nav-container .n-badge");
    var unread = badge && badge.textContent.trim() ? badge.textContent.trim() : "0";
    var portalCard = root.querySelector('[data-rcc-card="portal"]');
    var profileCard = root.querySelector('[data-rcc-card="profile"]');
    var progress = root.querySelector(".rcc-bento-progress");

    setText(portalCard.querySelector(".rcc-bento-card__title"), portalName);
    setText(profileCard.querySelector(".rcc-bento-card__title"), greeting || "Your profile");
    setText(
      root.querySelector('[data-rcc-card="course"] .rcc-bento-card__caption'),
      courseName
    );
    setText(
      root.querySelector('[data-rcc-card="files"] .rcc-bento-card__caption'),
      filesText
    );
    setText(
      root.querySelector('[data-rcc-card="notifications"] .rcc-bento-card__metric'),
      unread
    );
    setText(progress.querySelector(".rcc-bento-progress__value"), progressValue + "%");
    progress.style.setProperty("--rcc-progress", progressValue * 3.6 + "deg");
    progress.setAttribute("aria-valuenow", String(progressValue));

    if (sidebarImage && sidebarImage.src) {
      if (portalCard.querySelector(".rcc-bento-card__logo").src !== sidebarImage.src) {
        portalCard.querySelector(".rcc-bento-card__logo").src = sidebarImage.src;
      }
      portalCard.querySelector(".rcc-bento-card__logo").hidden = false;
    }
    if (profileImage && profileImage.src) {
      if (profileCard.querySelector(".rcc-bento-card__avatar").src !== profileImage.src) {
        profileCard.querySelector(".rcc-bento-card__avatar").src = profileImage.src;
      }
      profileCard.querySelector(".rcc-bento-card__avatar").hidden = false;
    }

    ["profile", "course", "community", "files", "notifications"].forEach(function (action) {
      var card = root.querySelector('[data-rcc-action="' + action + '"]');
      var available = Boolean(findNativeControl(action));
      card.disabled = !available;
      card.setAttribute("aria-disabled", String(!available));
    });
  }

  function reconcile() {
    if (lastPathname !== window.location.pathname) {
      lastPathname = window.location.pathname;
      navigationPending = false;
    }

    var available = isPortalHomeAvailable();
    var root = document.getElementById(ROOT_ID);
    var toggle = document.getElementById(TOGGLE_ID);

    scheduled = false;

    if (!available) {
      document.body.classList.remove("rcc-grid-theme", "rcc-default-theme");
      if (root) root.hidden = true;
      if (toggle) toggle.hidden = true;
      return;
    }

    if (!root) root = buildDashboard();
    if (!toggle) toggle = buildToggle();

    root.hidden = false;
    toggle.hidden = false;
    updateDashboard(root);
    applyTheme(getStoredTheme());
  }

  function scheduleReconcile() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(reconcile);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleReconcile, { once: true });
  } else {
    scheduleReconcile();
  }

  observer = new MutationObserver(scheduleReconcile);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["aria-valuenow", "src", "class"]
  });

  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY) scheduleReconcile();
  });

  document.dispatchEvent(
    new CustomEvent("rcc:surface-ready", {
      detail: { release: RELEASE, surface: "portal-home" }
    })
  );
})();
