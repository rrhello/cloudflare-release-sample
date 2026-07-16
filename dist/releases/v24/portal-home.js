(function () {
  "use strict";

  var RELEASE = "v24";
  var STORAGE_KEY = "rcc:portal-dashboard-theme";
  var GRID_THEME = "grid";
  var DEFAULT_THEME = "default";
  var ROOT_ID = "rcc-bento-dashboard";
  var TOGGLE_ID = "rcc-dashboard-theme-toggle";
  var COURSE_BACK_ID = "rcc-course-back";
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

  function createActionIcon(pathData) {
    var icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("width", "18");
    icon.setAttribute("height", "18");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    icon.appendChild(path);
    return icon;
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

    if (!control) {
      if (window.rccTrace) window.rccTrace("portal:native-control-missing", { action: action });
      return;
    }

    if (window.rccTrace) {
      window.rccTrace("portal:native-control", {
        action: action,
        control: control.id || control.getAttribute("aria-label") || control.tagName
      });
    }

    if (action === "course" || action === "community") {
      navigationPending = true;
      document.body.classList.remove("rcc-grid-theme");
      if (document.getElementById(ROOT_ID)) {
        document.getElementById(ROOT_ID).hidden = true;
      }
      document.dispatchEvent(new CustomEvent("rcc:loading-start"));
    }

    control.click();
    if (window.rccTrace) window.rccTrace("portal:native-control-clicked", { action: action });

    if (navigationPending) {
      window.setTimeout(function () {
        if (window.location.pathname === "/home") {
          navigationPending = false;
          scheduleReconcile();
          document.dispatchEvent(new CustomEvent("rcc:loading-end"));
          if (window.rccTrace) {
            window.rccTrace("portal:navigation-fallback-home", { action: action });
          }
        }
      }, 1500);
    }
  }

  function findVisibleAccountAction(pattern) {
    return Array.prototype.slice.call(
      document.querySelectorAll("button, a, [role='button'], [role='menuitem']")
    ).find(function (node) {
      return node.offsetParent !== null && pattern.test((node.textContent || "").trim());
    }) || null;
  }

  function activateAccountAction(action) {
    var profileControl = findNativeControl("profile");
    var pattern = action === "logout"
      ? /^(log\s*out|sign\s*out)$/i
      : /^(manage your account|manage account|account settings)$/i;
    var completed = false;

    if (!profileControl) {
      if (window.rccTrace) window.rccTrace("portal:account-menu-missing", { action: action });
      return;
    }

    profileControl.click();

    function chooseNativeAction() {
      var target;
      if (completed) return;
      target = findVisibleAccountAction(pattern);
      if (!target) return;
      completed = true;
      if (window.rccTrace) window.rccTrace("portal:account-action", { action: action });
      target.click();
    }

    window.setTimeout(chooseNativeAction, 80);
    window.setTimeout(chooseNativeAction, 240);
    window.setTimeout(function () {
      if (!completed && window.rccTrace) {
        window.rccTrace("portal:account-action-missing", { action: action });
      }
    }, 400);
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
    var profileCard = createCard("profile", "Your profile", "Member");
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
    addMetric(profileCard, "Member", "Manage your portal account");
    var profileMenu = createElement("div", "rcc-profile-actions");
    var manageAccount = createElement("button", "rcc-profile-actions__item");
    var logout = createElement("button", "rcc-profile-actions__item rcc-profile-actions__item--logout");

    profileMenu.id = "rcc-profile-actions-menu";
    manageAccount.type = "button";
    manageAccount.dataset.rccAccountAction = "manage";
    manageAccount.dataset.tooltip = "Open your GHL account settings";
    manageAccount.title = "Manage Your Account";
    manageAccount.setAttribute("aria-label", "Manage Your Account");
    manageAccount.classList.add("rcc-profile-actions__item--account");
    manageAccount.appendChild(createElement("span", "", "Account"));
    logout.type = "button";
    logout.dataset.rccAccountAction = "logout";
    logout.dataset.tooltip = "Securely sign out of the portal";
    logout.title = "Log Out";
    logout.setAttribute("aria-label", "Log Out");
    logout.appendChild(createActionIcon("M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"));
    logout.appendChild(createElement("span", "rcc-visually-hidden", "Log Out"));
    profileMenu.appendChild(manageAccount);
    profileMenu.appendChild(logout);
    profileCard.appendChild(profileMenu);

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
      var accountAction = event.target.closest("[data-rcc-account-action]");
      var actionCard = event.target.closest("[data-rcc-action]");

      if (accountAction) {
        activateAccountAction(accountAction.dataset.rccAccountAction);
        return;
      }
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

  function ensureCourseBackButton(courseRoute) {
    var button = document.getElementById(COURSE_BACK_ID);

    if (!courseRoute) {
      if (button) button.remove();
      return;
    }
    if (button) return;

    button = createElement("button", "rcc-course-back");
    button.id = COURSE_BACK_ID;
    button.type = "button";
    button.title = "Go back";
    button.setAttribute("aria-label", "Go back");
    button.appendChild(createActionIcon("M15 18l-6-6 6-6"));
    button.appendChild(createElement("span", "", "Back"));
    button.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.assign("/home");
      }
    });
    document.body.appendChild(button);
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

    ["course", "community", "files", "notifications"].forEach(function (action) {
      var card = root.querySelector('[data-rcc-action="' + action + '"]');
      var available = Boolean(findNativeControl(action));
      card.disabled = !available;
      card.setAttribute("aria-disabled", String(!available));
    });
    var profileAvailable = Boolean(findNativeControl("profile"));
    root.querySelectorAll("[data-rcc-account-action]").forEach(function (button) {
      button.disabled = !profileAvailable;
      button.setAttribute("aria-disabled", String(!profileAvailable));
    });
  }

  function reconcile() {
    var courseRoute = /^\/courses\/products\/[^/]+/.test(window.location.pathname);

    if (document.body) {
      document.body.classList.toggle(
        "rcc-course-product-route",
        courseRoute
      );
      ensureCourseBackButton(courseRoute);
    }

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
