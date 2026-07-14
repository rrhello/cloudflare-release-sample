# Dynamic Community Group Branding

Starting with release `v6`, the RCC Community runtime exposes the active GHL group slug on both the `<html>` and `<body>` elements:

```html
<html data-rcc-group="accelerator">
<body data-rcc-group="accelerator">
```

The value is derived from the active route:

```text
/communities/groups/<group-slug>/...
```

It is refreshed during initial rendering, DOM updates, `pushState`, `replaceState`, and `popstate`. The attribute is removed when the active route is not a Community group route.

## Group Settings: Branding Custom CSS

CSS entered in a group's own **Group Settings → Branding → Custom CSS** can use the generic hook below because GHL associates that CSS with the group:

```css
/* GROUP SETTINGS > BRANDING > CUSTOM CSS */

body[data-rcc-group] {
  --rcc-group-accent: #3a4a8a;
  --rcc-group-accent-dark: #273467;
  --rcc-group-accent-light: #eef2ff;
}

body[data-rcc-group] #community-banner {
  border-color: var(--rcc-group-accent) !important;
}

body[data-rcc-group] .community-button-primary {
  background: var(--rcc-group-accent) !important;
  border-color: var(--rcc-group-accent) !important;
  color: #fff !important;
}

body[data-rcc-group] .community-button-primary:hover {
  background: var(--rcc-group-accent-dark) !important;
  border-color: var(--rcc-group-accent-dark) !important;
}
```

This generic form is resilient when an owner edits the group name or slug, provided GHL continues loading that group's own branding CSS.

## Central Cloudflare Community CSS

Rules maintained in the shared versioned `community.css` must use the exact slug so they do not affect every group:

```css
body[data-rcc-group="accelerator"] {
  --rcc-group-accent: #3a4a8a;
}

body[data-rcc-group="accelerator"] #community-banner {
  border-color: var(--rcc-group-accent) !important;
}
```

If the group slug changes, exact-slug rules in the central bundle must be updated in a new immutable release. Prefer the group's own Branding Custom CSS for owner-managed colors and presentation that should follow an editable group.

## Group Settings: Branding Custom JavaScript

No group-level JavaScript is required to create `data-rcc-group`; `community.js` manages it centrally.

Group-level Custom JavaScript should be reserved for behavior that CSS cannot implement. It can read the current identifier as follows:

```javascript
/* GROUP SETTINGS > BRANDING > CUSTOM JS */
(function () {
  "use strict";

  var group = document.body.dataset.rccGroup || "";

  if (!group) return;

  console.info("RCC group branding active:", group);
})();
```

Do not use group Custom JavaScript to load another copy of the RCC release loader. The global GHL Advanced Custom JavaScript should remain the only release entry point.

## Runtime verification

On a Community group page, run:

```javascript
({
  release: document.documentElement.dataset.rccRelease,
  surface: document.documentElement.dataset.rccSurface,
  group: document.body.dataset.rccGroup
})
```

Example result:

```javascript
{
  release: "v6",
  surface: "community",
  group: "accelerator"
}
```

After leaving the Community group route:

```javascript
document.body.hasAttribute("data-rcc-group")
```

Expected:

```text
false
```

## Selector guidance

Prefer:

```text
body[data-rcc-group]
body[data-rcc-group="accelerator"]
[data-rcc-group-slug="accelerator"]
```

Avoid using generated Vue attributes such as `data-v-*`, because they can change after GHL application deployments.

Avoid styling the entire group from generic utility classes such as `.flex`, `.sidebar`, or `.col-span-2`; those classes are reused across Community pages.
