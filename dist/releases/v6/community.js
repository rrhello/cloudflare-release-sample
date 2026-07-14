(function () {
  "use strict";

  var PINNED_CARD_SELECTOR = ".pinned-post-card";
  var ENHANCED_ATTR = "data-rcc-enhanced";
  var GROUP_LIST_ATTR = "data-rcc-group-list-ready";
  var HISTORY_PATCHED_ATTR = "data-rcc-history-patched";
  var observer;
  var rafId = 0;

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
    return channelList || null;
  }

  function buildGroupRow(button, index) {
    var img = button.querySelector("img[alt]");
    var rawName = img ? img.getAttribute("alt") : "";
    var name = readableGroupName(rawName);
    var tone = groupTone(rawName || name, index);
    var row = document.createElement("button");
    var dot = document.createElement("span");
    var label = document.createElement("span");

    row.type = "button";
    row.className = "rcc-community-group-row rcc-community-group-row--" + tone;
    row.setAttribute("data-rcc-source-group", rawName || name);
    row.setAttribute("data-rcc-group-slug", slugify(name));
    row.setAttribute("aria-label", "Open " + name);

    dot.className = "rcc-community-group-dot";
    label.className = "rcc-community-group-label";
    label.textContent = name;

    row.appendChild(dot);
    row.appendChild(label);

    row.addEventListener("click", function () {
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
    if (insertPoint.getAttribute(GROUP_LIST_ATTR) === "true") return;

    var list = document.createElement("div");
    var head = document.createElement("div");

    list.className = "rcc-community-group-list";
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
        var result = original.apply(this, arguments);
        window.setTimeout(function () {
          updateCurrentCommunityGroup();
          updatePrivateGroupPage();
          updateActiveCommunityGroups();
        }, 0);
        return result;
      };
    });

    window.addEventListener("popstate", function () {
      updateCurrentCommunityGroup();
      updatePrivateGroupPage();
      updateActiveCommunityGroups();
    });
  }

  function updatePrivateGroupPage() {
    if (!document.body) return;

    var isPrivateGroup = Boolean(
      document.getElementById("joinGroup__btn") &&
      document.getElementById("container_group_about")
    );

    document.body.classList.toggle("rcc-private-group-page", isPrivateGroup);
  }

  function enhancePage() {
    document.documentElement.classList.add("rcc-mockup-js");
    document.body && document.body.classList.add("rcc-mockup-js");

    updateCurrentCommunityGroup();
    updatePrivateGroupPage();
    enhanceFeaturedPinnedCards();

    enhanceCommunityGroups();
    enhanceFeedLayout();
    updateActiveCommunityGroups();
    patchHistoryRouting();
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
