(function () {
  "use strict";

  var PINNED_CARD_SELECTOR = ".pinned-post-card";
  var ENHANCED_ATTR = "data-rcc-enhanced";
  var GROUP_LIST_ATTR = "data-rcc-group-list-ready";
  var HISTORY_PATCHED_ATTR = "data-rcc-history-patched";
  var RELEASE = "v11";
  var observer;
  var rafId = 0;
  var readyTimer;

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

  function updateActiveCommunityGroups() {
    var slug = currentGroupSlug();
    var rows = Array.prototype.slice.call(document.querySelectorAll(".rcc-community-group-row"));
    var matched = false;

    rows.forEach(function (row) {
      var rowSlug = row.getAttribute("data-rcc-group-slug") || "";
      var active = Boolean(slug && rowSlug === slug);
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
    var img = button.querySelector("img[alt]");
    var rawName = img ? img.getAttribute("alt") : "";
    var name = readableGroupName(rawName);
    var tone = groupTone(rawName || name, index);
    var row = document.createElement("button");
    var dot = document.createElement("span");
    var label = document.createElement("span");
    var lock = document.createElement("span");

    row.type = "button";
    row.className = "rcc-community-group-row rcc-community-group-row--" + tone;
    row.setAttribute("data-rcc-source-group", rawName || name);
    row.setAttribute("data-rcc-group-slug", slugify(name));
    row.setAttribute("aria-label", "Open private community " + name);

    dot.className = "rcc-community-group-dot";
    label.className = "rcc-community-group-label";
    label.textContent = name;
    lock.className = "rcc-community-group-lock";
    lock.textContent = "🔒";
    lock.setAttribute("aria-hidden", "true");
    lock.title = "Private community";

    row.appendChild(dot);
    row.appendChild(label);
    row.appendChild(lock);

    row.addEventListener("click", function () {
      document.dispatchEvent(new CustomEvent("rcc:loading-start"));
      Array.prototype.slice.call(document.querySelectorAll(".rcc-community-group-row")).forEach(function (item) {
        setActiveCommunityRow(item, item === row);
      });
      button.click();
      window.setTimeout(updateActiveCommunityGroups, 120);
      window.setTimeout(updateActiveCommunityGroups, 500);
    });

    return row;
  }

  function enhanceCommunityGroups() {
    var insertPoint = findSidebarInsertPoint();
    var groupButtons = findGroupButtons();

    if (!insertPoint || groupButtons.length === 0) return;

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

    if (insertPoint.getAttribute(GROUP_LIST_ATTR) === "true") return;

    var list = document.createElement("div");
    var head = document.createElement("div");

    list.className = "rcc-community-group-list";
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
        document.dispatchEvent(new CustomEvent("rcc:loading-start"));
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
      document.dispatchEvent(new CustomEvent("rcc:loading-start"));
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

    if (!isPrivateGroup || !list) {
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
    window.clearTimeout(readyTimer);
    readyTimer = window.setTimeout(function () {
      document.documentElement.classList.add("rcc-custom-layout-ready");
      document.dispatchEvent(new CustomEvent("rcc:loading-end"));
      document.dispatchEvent(
        new CustomEvent("rcc:surface-ready", {
          detail: { release: RELEASE, surface: "community" }
        })
      );
    }, 240);
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

    observer = new MutationObserver(scheduleEnhance);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

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
