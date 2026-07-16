(function () {
  "use strict";

  var PINNED_CARD_SELECTOR = ".pinned-post-card";
  var ENHANCED_ATTR = "data-rcc-enhanced";
  var GROUP_LIST_ATTR = "data-rcc-group-list-ready";
  var HISTORY_PATCHED_ATTR = "data-rcc-history-patched";
  var RELEASE = "v20";
  var observer;
  var rafId = 0;
  var readyTimer;
  var loadingStartedAt = Date.now();
  var lastMutationAt = loadingStartedAt;
  var navigationPending = false;
  var sawNavigationMutation = false;
  var surfaceReady = false;
  var bootstrapFromCommunities = window.location.pathname === "/communities";
  var bootstrapGroupPath = "";
  var bootstrapGroupStartedAt = 0;

  function textOf(node) {
    return node && node.textContent ? node.textContent.trim().replace(/\s+/g, " ") : "";
  }

  function unclamp(node) {
    if (!node) return;

    [
      "truncate",
      "line-clamp-1",
      "line-clamp-2",
      "line-clamp-[8]",
      "overflow-hidden",
      "h-[170px]",
      "h-[210px]"
    ].forEach(function (className) {
      node.classList.remove(className);
    });

    node.style.height = "auto";
    node.style.maxHeight = "none";
    node.style.overflow = "visible";
    node.style.webkitLineClamp = "unset";
  }

  function enhancePinnedMedia(card) {
    var media = card.querySelector(
      ".thumbnail-container, .image-loader, .viewer-image, img.viewer-image, img[class*='object-cover'], video"
    );
    var content = card.querySelector(".post_content");

    if (!media || !content) return;

    var mediaWrap = media.closest(".thumbnail-container, .image-loader") || media.parentElement || media;
    card.classList.add("rcc-pinned-has-media");
    mediaWrap.classList.add("rcc-pinned-thumbnail");

    if (!content.contains(mediaWrap)) {
      content.appendChild(mediaWrap);
    }
  }

  function enhancePinnedCard(card, index) {
    card.querySelectorAll(".rcc-pinned-header").forEach(function (header) {
      header.remove();
    });

    if (card.getAttribute(ENHANCED_ATTR) === "true") return;

    card.setAttribute(ENHANCED_ATTR, "true");
    card.setAttribute("data-rcc-pinned-index", String(index + 1));
    card.classList.add("rcc-featured-pinned-card");
    card.classList.add("rcc-welcome-post-card");

    card.querySelectorAll(".post_content, .content-description, .hl-text-lg-medium").forEach(unclamp);
    card.querySelectorAll('[class*="h-["], [class*="line-clamp"]').forEach(function (node) {
      if (card.contains(node)) unclamp(node);
    });

    enhancePinnedMedia(card);
  }

  function enhanceFeaturedPinnedCards() {
    Array.prototype.slice.call(
      document.querySelectorAll(
        ".featured_post_card .pinned-post-card, .featured_post_card [id='pinned-post-card'], .featured_post_card .post_card"
      )
    )
      .forEach(enhancePinnedCard);
  }

  function readableGroupName(name) {
    return name ? name.trim() : "Community";
  }

  function groupTone(name, index) {
    return index === 0 ? "sprint" : "neutral";
  }

  function slugify(value) {
    return (value || "")
      .toLowerCase()
      .replace(/™/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function currentGroupSlug() {
    var match = window.location.pathname.match(/\/groups\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]).toLowerCase() : "";
  }

  function updateCurrentCommunityGroup() {
    if (!document.body) return;

    var slug = currentGroupSlug();

    if (slug) {
      document.body.setAttribute("data-rcc-group", slug);
      document.documentElement.setAttribute("data-rcc-group", slug);
    } else {
      document.body.removeAttribute("data-rcc-group");
      document.documentElement.removeAttribute("data-rcc-group");
    }
  }

  function setActiveCommunityRow(row, active) {
    row.classList.toggle("is-active", active);
    if (active) {
      row.setAttribute("aria-current", "page");
    } else {
      row.removeAttribute("aria-current");
    }
  }

  function groupButtonName(button) {
    var img = button && button.querySelector("img[alt]");
    return readableGroupName(img ? img.getAttribute("alt") : "");
  }

  function groupButtonSlug(button) {
    var explicitSlug = button && (
      button.getAttribute("data-group-slug") ||
      button.getAttribute("data-slug") ||
      button.getAttribute("data-group-id")
    );
    var link = button && button.closest("a[href*='/communities/groups/']");
    var match = link && link.getAttribute("href")
      ? link.getAttribute("href").match(/\/groups\/([^/?#]+)/)
      : null;

    return (match ? decodeURIComponent(match[1]) : explicitSlug || slugify(groupButtonName(button)))
      .toLowerCase();
  }

  function groupButtonIsActive(button) {
    var classes = button ? button.className : "";
    var currentName = textOf(document.getElementById("group_info_name"));

    return Boolean(button && (
      button.getAttribute("aria-current") === "page" ||
      button.getAttribute("aria-selected") === "true" ||
      button.getAttribute("data-state") === "active" ||
      (typeof classes === "string" && /(^|\s)(active|selected|is-active)(\s|$)/i.test(classes)) ||
      (currentName && groupButtonName(button) === currentName)
    ));
  }

  function groupButtonIsLocked(button) {
    var descriptor = [
      button && button.getAttribute("aria-label"),
      button && button.getAttribute("title"),
      button && button.getAttribute("data-status"),
      button && button.getAttribute("data-access"),
      button && textOf(button)
    ].filter(Boolean).join(" ");
    var lockIndicator = button && button.querySelector(
      '[aria-label*="lock" i], [title*="lock" i], [data-icon*="lock" i], [class*="lock" i]'
    );

    return Boolean(button && (
      button.disabled ||
      button.getAttribute("aria-disabled") === "true" ||
      /(^|\s)(locked|restricted|request access|join group)(\s|$)/i.test(descriptor) ||
      lockIndicator
    ));
  }

  function findLiveGroupButton(sourceName, sourceSlug) {
    var buttons = findGroupButtons();
    var normalizedName = (sourceName || "").trim().toLowerCase();

    return buttons.find(function (button) {
      return groupButtonSlug(button) === sourceSlug;
    }) || buttons.find(function (button) {
      return groupButtonName(button).toLowerCase() === normalizedName;
    }) || null;
  }

  function updateActiveCommunityGroups() {
    var slug = currentGroupSlug();
    var rows = Array.prototype.slice.call(document.querySelectorAll(".rcc-community-group-row"));
    var liveButtons = findGroupButtons();
    var matched = false;

    rows.forEach(function (row) {
      var rowSlug = row.getAttribute("data-rcc-group-slug") || "";
      var sourceName = row.getAttribute("data-rcc-source-group") || "";
      var liveButton = liveButtons.find(function (button) {
        return groupButtonSlug(button) === rowSlug ||
          groupButtonName(button).toLowerCase() === sourceName.toLowerCase();
      });
      var active = Boolean(
        (slug && rowSlug === slug) ||
        groupButtonIsActive(liveButton)
      );
      var locked = groupButtonIsLocked(liveButton);
      var lock = row.querySelector(".rcc-community-group-lock");

      row.classList.toggle("is-locked", locked);
      row.setAttribute("data-rcc-locked", String(locked));
      if (lock) lock.hidden = !locked;
      setActiveCommunityRow(row, active);
      matched = matched || active;
    });

    if (!matched && rows.length) {
      var currentName = textOf(document.getElementById("group_info_name"));
      rows.forEach(function (row) {
        setActiveCommunityRow(row, Boolean(currentName && row.getAttribute("data-rcc-source-group") === currentName));
      });
    }
  }

  function findGroupButtons() {
    var railEnd = document.getElementById("observe-list-end");
    var rail = railEnd ? railEnd.parentElement : null;
    var scope = rail || document;

    if (rail) {
      rail.classList.add("rcc-source-group-rail");
      if (rail.parentElement) rail.parentElement.classList.add("rcc-source-group-rail-shell");
    }

    var images = Array.prototype.slice.call(
      scope.querySelectorAll('img[alt]')
    );

    return images
      .map(function (img) {
        return img.closest('[role="button"]');
      })
      .filter(function (button, index, items) {
        return button && items.indexOf(button) === index;
      });
  }

  function findSidebarInsertPoint() {
    var home = document.getElementById("home-timeline");
    if (home && home.parentElement) return home.parentElement;

    var channelList = document.querySelector(".channel-list .content");
    if (channelList) return channelList;

    return document.querySelector(".communities-preview .no-scroll.sidebar") || null;
  }

  function buildGroupRow(button, index) {
    var rawName = groupButtonName(button);
    var name = readableGroupName(rawName);
    var sourceSlug = groupButtonSlug(button);
    var locked = groupButtonIsLocked(button);
    var tone = groupTone(rawName || name, index);
    var row = document.createElement("button");
    var dot = document.createElement("span");
    var label = document.createElement("span");
    var lock = document.createElement("span");

    row.type = "button";
    row.className = "rcc-community-group-row rcc-community-group-row--" + tone;
    row.setAttribute("data-rcc-source-group", rawName || name);
    row.setAttribute("data-rcc-group-slug", sourceSlug);
    row.setAttribute("data-rcc-locked", String(locked));
    row.setAttribute("aria-label", "Open community " + name);
    row.classList.toggle("is-locked", locked);

    dot.className = "rcc-community-group-dot";
    label.className = "rcc-community-group-label";
    label.textContent = name;
    lock.className = "rcc-community-group-lock";
    lock.textContent = "🔒";
    lock.setAttribute("aria-hidden", "true");
    lock.title = "Restricted community";
    lock.hidden = !locked;

    row.appendChild(dot);
    row.appendChild(label);
    row.appendChild(lock);

    row.addEventListener("click", function () {
      var liveButton = findLiveGroupButton(rawName || name, sourceSlug);

      if (!liveButton) {
        enhanceCommunityGroups(true);
        liveButton = findLiveGroupButton(rawName || name, sourceSlug);
      }

      if (!liveButton) {
        if (window.rccTrace) {
          window.rccTrace("community:group-control-missing", {
            name: rawName || name,
            slug: sourceSlug
          });
        }
        return;
      }

      Array.prototype.slice.call(document.querySelectorAll(".rcc-community-group-row")).forEach(function (item) {
        setActiveCommunityRow(item, item === row);
      });
      if (window.rccTrace) {
        window.rccTrace("community:group-control-click", {
          name: groupButtonName(liveButton),
          slug: groupButtonSlug(liveButton),
          locked: groupButtonIsLocked(liveButton)
        });
      }
      document.dispatchEvent(new CustomEvent("rcc:loading-start"));
      liveButton.click();
      window.setTimeout(updateActiveCommunityGroups, 120);
      window.setTimeout(updateActiveCommunityGroups, 500);
    });

    return row;
  }

  function enhanceCommunityGroups(force) {
    var insertPoint = findSidebarInsertPoint();
    var groupButtons = findGroupButtons();
    var signature;
    var existingList;

    if (!insertPoint || groupButtons.length === 0) return;

    signature = groupButtons.map(function (button) {
      return [
        groupButtonName(button),
        groupButtonSlug(button),
        groupButtonIsLocked(button)
      ].join(":");
    }).join("|");

    Array.prototype.slice.call(
      document.querySelectorAll(".rcc-community-group-list")
    ).forEach(function (existingList) {
      if (existingList.parentElement !== insertPoint) {
        if (existingList.parentElement) {
          existingList.parentElement.removeAttribute(GROUP_LIST_ATTR);
        }
        existingList.remove();
      }
    });

    existingList = insertPoint.querySelector(":scope > .rcc-community-group-list");
    if (
      !force &&
      existingList &&
      existingList.getAttribute("data-rcc-group-signature") === signature
    ) {
      updateActiveCommunityGroups();
      return;
    }

    if (existingList) existingList.remove();
    insertPoint.removeAttribute(GROUP_LIST_ATTR);

    var list = document.createElement("div");
    var head = document.createElement("div");

    list.className = "rcc-community-group-list";
    list.setAttribute("data-rcc-group-signature", signature);
    if (insertPoint.classList.contains("sidebar")) {
      list.classList.add("rcc-community-group-list--standalone");
    }
    head.className = "rcc-community-group-head";
    head.textContent = "Communities";
    list.appendChild(head);

    groupButtons.forEach(function (button, index) {
      button.classList.add("rcc-source-group-button");
      list.appendChild(buildGroupRow(button, index));
    });

    insertPoint.insertBefore(list, insertPoint.firstChild);
    insertPoint.setAttribute(GROUP_LIST_ATTR, "true");
    updateActiveCommunityGroups();
  }

  function enhanceFeedLayout() {
    var rightSidebar = document.querySelector(".sidebar.sticky_scroll.col-span-2, .sidebar.sticky_scroll");
    var postContainer = document.getElementById("post-container");
    var feedColumn = postContainer ? postContainer.closest(".sticky_scroll") : null;
    var layoutGrid = feedColumn ? feedColumn.parentElement : null;

    if (!rightSidebar || !feedColumn || !layoutGrid) return;

    layoutGrid.classList.add("rcc-feed-layout");
    feedColumn.classList.add("rcc-feed-main");
    rightSidebar.classList.add("rcc-feed-sidebar");
  }

  function patchHistoryRouting() {
    if (document.documentElement.getAttribute(HISTORY_PATCHED_ATTR) === "true") return;
    document.documentElement.setAttribute(HISTORY_PATCHED_ATTR, "true");

    ["pushState", "replaceState"].forEach(function (method) {
      var original = window.history[method];
      window.history[method] = function () {
        var routeChanged = false;
        if (arguments.length > 2 && arguments[2] != null) {
          try {
            routeChanged = new URL(String(arguments[2]), window.location.href).href !== window.location.href;
          } catch (error) {
            routeChanged = false;
          }
        }
        if (routeChanged) {
          startCommunityLoading();
        }
        var result = original.apply(this, arguments);
        window.setTimeout(function () {
          updateCurrentCommunityGroup();
          updatePrivateGroupPage();
          updateActiveCommunityGroups();
          scheduleEnhance();
        }, 0);
        return result;
      };
    });

    window.addEventListener("popstate", function () {
      startCommunityLoading();
      updateCurrentCommunityGroup();
      updatePrivateGroupPage();
      updateActiveCommunityGroups();
      scheduleEnhance();
    });
  }

  function enhanceCommunityNavigation() {
    var homeButton = document.querySelector("#home-icon-or-gokollab-logo button");
    var groupInfo = document.getElementById("group-info");
    var switchButton = groupInfo ? groupInfo.querySelector("button") : null;

    if (homeButton) homeButton.classList.add("rcc-community-home-button");
    if (switchButton) {
      switchButton.classList.add("rcc-community-switcher-button");
      if (switchButton.parentElement) {
        switchButton.parentElement.classList.add("rcc-community-switcher-wrap");
      }
    }
  }

  function ensureDiscoveryCard(isPrivateGroup) {
    var nativeMessage = document.getElementById("side-bar h-container");
    var list = document.querySelector(".rcc-community-group-list");
    var card = document.getElementById("rcc-discovery-card");
    var heading;
    var icon;
    var message;

    if (nativeMessage) {
      nativeMessage.classList.add("rcc-discovery-native-source");
      nativeMessage.setAttribute("aria-hidden", "true");
    }

    if (!isPrivateGroup || !list || !surfaceReady) {
      if (card) card.remove();
      return;
    }

    if (!card) {
      card = document.createElement("aside");
      card.id = "rcc-discovery-card";
      card.className = "rcc-discovery-card";
      card.setAttribute("aria-labelledby", "rcc-discovery-card-title");

      icon = document.createElement("div");
      icon.className = "rcc-discovery-card-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "🔒";

      heading = document.createElement("h2");
      heading.id = "rcc-discovery-card-title";
      heading.className = "rcc-discovery-card-title";
      heading.textContent = "Discover Channels";

      message = document.createElement("p");
      message.className = "rcc-discovery-card-message";
      message.textContent = "Join this private community to unlock its channels and resources.";

      card.appendChild(icon);
      card.appendChild(heading);
      card.appendChild(message);
    }

    if (card.parentElement !== list || card !== list.lastElementChild) {
      list.appendChild(card);
    }
    card.classList.remove("rcc-discovery-card--stale");
  }

  function updateUnjoinedCommunityControls(isUnjoined) {
    var tabs = Array.prototype.slice.call(
      document.querySelectorAll('.communities-top-nav [aria-label="Tab Switcher"]')
    );
    var chat = document.getElementById("communities-top-nav-bar-chats-web");

    document.body.classList.toggle("rcc-unjoined-community-page", isUnjoined);

    tabs.forEach(function (tab) {
      tab.classList.toggle("rcc-muted-community-tab", isUnjoined);
      if (isUnjoined) {
        tab.setAttribute("aria-disabled", "true");
        tab.setAttribute("tabindex", "-1");
      } else {
        tab.removeAttribute("aria-disabled");
        tab.setAttribute("tabindex", "0");
      }
    });

    if (chat) chat.setAttribute("aria-hidden", String(isUnjoined));
  }

  function updatePrivateGroupPage() {
    if (!document.body) return;

    var isPrivateGroup = Boolean(
      document.getElementById("joinGroup__btn") &&
      document.getElementById("container_group_about")
    );

    document.body.classList.toggle("rcc-private-group-page", isPrivateGroup);
    updateUnjoinedCommunityControls(isPrivateGroup);
    ensureDiscoveryCard(isPrivateGroup);
  }

  function markSurfaceReady() {
    if (surfaceReady || readyTimer) return;

    function checkReady() {
      var now = Date.now();
      var elapsed = now - loadingStartedAt;
      var quietFor = now - lastMutationAt;
      var minimumWait = navigationPending ? 650 : 240;
      var destinationChanged = !navigationPending || sawNavigationMutation;
      var settled = elapsed >= minimumWait && destinationChanged && quietFor >= 160;
      var awaitingDefaultGroup = window.location.pathname === "/communities" && elapsed < 2200;
      var currentPath = window.location.pathname;
      var isGroupPath = /^\/communities\/groups\/[^/]+\/.+/.test(currentPath);
      var bootstrapStableFor = 0;
      var awaitingBootstrapRedirect = false;

      if (bootstrapFromCommunities && isGroupPath) {
        if (bootstrapGroupPath !== currentPath) {
          bootstrapGroupPath = currentPath;
          bootstrapGroupStartedAt = now;
        }
        bootstrapStableFor = now - bootstrapGroupStartedAt;
        awaitingBootstrapRedirect =
          /\/home\/?$/.test(currentPath) && bootstrapStableFor < 1700;
      }

      var reachedLimit = elapsed >= 2400;
      if (awaitingDefaultGroup || awaitingBootstrapRedirect) settled = false;

      if (window.rccTrace) {
        window.rccTrace("community:ready-check", {
          elapsed: elapsed,
          quietFor: quietFor,
          navigationPending: navigationPending,
          sawNavigationMutation: sawNavigationMutation,
          awaitingDefaultGroup: awaitingDefaultGroup,
          bootstrapFromCommunities: bootstrapFromCommunities,
          bootstrapGroupPath: bootstrapGroupPath,
          bootstrapStableFor: bootstrapStableFor,
          awaitingBootstrapRedirect: awaitingBootstrapRedirect,
          settled: settled,
          reachedLimit: reachedLimit
        });
      }

      if (!settled && !reachedLimit) {
        readyTimer = window.setTimeout(checkReady, 80);
        return;
      }

      readyTimer = null;
      navigationPending = false;
      surfaceReady = true;
      bootstrapFromCommunities = false;
      document.documentElement.classList.add("rcc-custom-layout-ready");
      ensureDiscoveryCard(document.body.classList.contains("rcc-private-group-page"));
      if (window.rccTrace) {
        window.rccTrace("community:ready", {
          elapsed: elapsed,
          byLimit: !settled && reachedLimit,
          privateGroup: document.body.classList.contains("rcc-private-group-page")
        });
      }
      document.dispatchEvent(new CustomEvent("rcc:loading-end"));
      document.dispatchEvent(
        new CustomEvent("rcc:surface-ready", {
          detail: { release: RELEASE, surface: "community" }
        })
      );
    }

    readyTimer = window.setTimeout(checkReady, 80);
  }

  function startCommunityLoading() {
    var staleCard = document.getElementById("rcc-discovery-card");
    var currentPath = window.location.pathname;

    window.clearTimeout(readyTimer);
    readyTimer = null;
    loadingStartedAt = Date.now();
    lastMutationAt = loadingStartedAt;
    navigationPending = true;
    sawNavigationMutation = false;
    surfaceReady = false;
    if (currentPath === "/communities") {
      bootstrapFromCommunities = true;
      bootstrapGroupPath = "";
      bootstrapGroupStartedAt = 0;
    }
    document.documentElement.classList.remove("rcc-custom-layout-ready");
    if (staleCard) staleCard.remove();
    if (window.rccTrace) {
      window.rccTrace("community:loading-start", {
        staleCardRemoved: Boolean(staleCard)
      });
    }
  }

  function enhancePage() {
    document.documentElement.classList.add("rcc-mockup-js");
    document.body && document.body.classList.add("rcc-mockup-js");

    updateCurrentCommunityGroup();
    updatePrivateGroupPage();
    enhanceCommunityNavigation();
    enhanceFeaturedPinnedCards();

    enhanceCommunityGroups();
    ensureDiscoveryCard(document.body.classList.contains("rcc-private-group-page"));
    enhanceFeedLayout();
    updateActiveCommunityGroups();
    patchHistoryRouting();
    markSurfaceReady();
  }

  function scheduleEnhance() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(function () {
      rafId = 0;
      enhancePage();
    });
  }

  function startObserver() {
    if (observer || !document.body) return;

    observer = new MutationObserver(function (mutations) {
      lastMutationAt = Date.now();
      if (navigationPending) sawNavigationMutation = true;
      if (window.rccTrace && navigationPending) {
        window.rccTrace("community:mutation", { count: mutations.length });
      }
      scheduleEnhance();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  document.addEventListener("rcc:loading-start", startCommunityLoading);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      enhancePage();
      startObserver();
    });
  } else {
    enhancePage();
    startObserver();
  }

})();
