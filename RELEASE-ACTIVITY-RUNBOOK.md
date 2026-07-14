# RCC Portal Release Activity Runbook

Use this checklist whenever a new Portal Home or Community customization must be incorporated into the GHL and Cloudflare versioning workflow.

This runbook uses `v4` as the last known-good release and `v5` as the candidate. Replace those values with the appropriate versions for the activity.

## 1. Choose the release numbers

Define:

```text
BASE_RELEASE=v4
CANDIDATE_RELEASE=v5
```

Rules:

- Start from the latest known-good release.
- Every candidate must be a complete release bundle.
- Never edit a version after Cloudflare has served it.
- If a deployed candidate needs correction, create the next version.

## 2. Open the release repository

```sh
cd /Users/laptop-162/Projects/RR/MAC/community/sprint/test-external/cloudflare-release-sample
git switch dev
git pull --rebase
git status --short --branch
```

Review unexpected local changes before continuing.

## 3. Create the candidate bundle

Copy the complete latest release:

```sh
cp -R dist/releases/v4 dist/releases/v5
```

The candidate should contain:

```text
dist/releases/v5/
├── release.js
├── shared.css
├── portal-home.css
├── portal-home.js
├── community.css
└── community.js
```

## 4. Put each change in the correct file

Use:

- `shared.css` for tokens, typography, focus states, and behavior shared by Portal Home and Community.
- `portal-home.css` for Portal Home presentation only.
- `portal-home.js` for Portal Home DOM hooks or behavior that CSS cannot implement.
- `community.css` for Community presentation, including private-group layouts.
- `community.js` for Community DOM detection, semantic classes, SPA handling, or behavior that CSS cannot implement.
- `release.js` only for release identity, asset loading, surface detection, and lifecycle infrastructure.

Do not put visual rules in `release.js`. Prefer CSS unless JavaScript is required to identify or enhance generated GHL markup.

## 5. Update all release identifiers

In `dist/releases/v5/release.js`:

```javascript
var RELEASE = "v5";
```

Update hard-coded release values in surface scripts, if present:

```javascript
detail: { release: "v5", surface: "portal-home" }
```

Check for stale identifiers:

```sh
rg -n 'v4|var RELEASE|detail:.*release' dist/releases/v5
```

Review each match. A candidate bundle should not accidentally report the base version.

## 6. Add page-specific detection when needed

Local captured HTML can contain body classes that do not exist in live GHL. When CSS depends on a custom class, add it through the appropriate surface script.

Example private-group detection for `community.js`:

```javascript
function updatePrivateGroupPage() {
  if (!document.body) return;

  var isPrivateGroup = Boolean(
    document.getElementById("joinGroup__btn") &&
    document.getElementById("container_group_about")
  );

  document.body.classList.toggle(
    "rcc-private-group-page",
    isPrivateGroup
  );
}
```

Call detection from the existing enhancement lifecycle and after SPA navigation. Detection must both add and remove its class so styles do not leak to other pages.

Keep enhancements idempotent: running them repeatedly must not duplicate elements, handlers, or assets.

## 7. Review and validate locally

Compare the full candidate with its base:

```sh
git diff --no-index --stat dist/releases/v4 dist/releases/v5
git diff --no-index dist/releases/v4 dist/releases/v5
```

A nonzero exit code from `git diff --no-index` is expected when differences exist.

Run JavaScript and patch checks:

```sh
node --check dist/releases/v5/release.js
node --check dist/releases/v5/portal-home.js
node --check dist/releases/v5/community.js
git diff --check
```

Review repository state:

```sh
git status --short
```

## 8. Commit and deploy the preview

Stage only the intended candidate:

```sh
git add dist/releases/v5
git status --short
git commit -m "Add RCC portal adjustments v5"
git push origin dev
```

Cloudflare Pages should create a deployment from `dev`.

In Cloudflare:

1. Open the `rccportal` Pages project.
2. Open **Deployments**.
3. Find the new `dev` deployment.
4. Wait for a successful result.
5. Copy its deployment-specific hostname.

Prefer this immutable hostname for QA:

```text
https://<deployment-hash>.rccportal.pages.dev
```

## 9. Verify every deployed asset

Confirm HTTP 200 for:

```text
https://<deployment-hash>.rccportal.pages.dev/releases/v5/release.js
https://<deployment-hash>.rccportal.pages.dev/releases/v5/shared.css
https://<deployment-hash>.rccportal.pages.dev/releases/v5/portal-home.css
https://<deployment-hash>.rccportal.pages.dev/releases/v5/portal-home.js
https://<deployment-hash>.rccportal.pages.dev/releases/v5/community.css
https://<deployment-hash>.rccportal.pages.dev/releases/v5/community.js
```

Do not begin GHL QA if any asset fails to load.

## 10. Preserve the current GHL loader

Before changing GHL:

1. Copy the current Advanced Custom JavaScript into a backup.
2. Record the active production version.
3. Keep its exact production URL for rollback.

GHL Advanced Custom CSS should normally contain only:

```css
/* RCC CSS is loaded by the versioned Cloudflare release script. */
```

Do not paste the full theme into GHL.

## 11. Load the candidate in a GHL test portal

Use a duplicated page or controlled test portal when possible.

Paste this into GHL Advanced Custom JavaScript, replacing the hostname and version:

```javascript
(function () {
  "use strict";

  var release = "v5";
  var releaseUrl =
    "https://<deployment-hash>.rccportal.pages.dev/releases/" +
    release +
    "/release.js";

  if (
    document.querySelector(
      'script[data-rcc-release-loader="' + release + '"]'
    )
  ) {
    return;
  }

  var script = document.createElement("script");
  script.src = releaseUrl;
  script.async = false;
  script.dataset.rccReleaseLoader = release;
  script.onerror = function () {
    console.error("RCC preview release failed:", releaseUrl);
  };
  document.head.appendChild(script);
})();
```

Do not include `<script>` tags if the GHL editor expects JavaScript only.

## 12. Start QA with a clean session

Close existing portal tabs and open a new incognito/private window. An old document may retain scripts, observers, or assets from a previous release.

Confirm runtime state in the browser console:

```javascript
document.documentElement.dataset.rccRelease
document.documentElement.dataset.rccSurface
```

Expected values inside Community for this example:

```text
v5
community
```

List loaded assets:

```javascript
Array.from(
  document.querySelectorAll("[data-rcc-asset]")
).map(function (element) {
  return element.href || element.src;
});
```

All candidate assets should reference `/releases/v5/`.

## 13. Complete general QA

Run this navigation sequence at least twice:

```text
Portal Home → Community → changed page → unchanged page → Portal Home
```

Verify:

- No console errors.
- The release and surface datasets are correct.
- No duplicate stylesheets or scripts are loaded.
- Page-specific classes are added only on their intended pages.
- Menus, buttons, modals, chat, and navigation still function.
- Keyboard focus remains visible.
- Desktop, tablet, and mobile layouts remain usable.
- Existing Portal Home and Community styling has not regressed.

## 14. Complete private-group QA

For private-group work, verify:

- The private page receives `body.rcc-private-group-page`.
- A public or joined group does not retain that class.
- The group header spans the intended content width.
- The group details and join card use the intended layout.
- The private discovery panel matches the RCC theme.
- The Join Group button works.
- Desktop uses the horizontal card when intended.
- Mobile collapses into a readable vertical card.

Check detection:

```javascript
document.body.classList.contains("rcc-private-group-page")
```

Expected on the private-group gate:

```text
true
```

Expected after navigating away:

```text
false
```

## 15. Correct a deployed candidate safely

If Cloudflare has already served `v5`, do not overwrite it. Create `v6`:

```sh
cp -R dist/releases/v5 dist/releases/v6
```

Then:

1. Change `RELEASE` to `v6`.
2. Update hard-coded surface event versions.
3. Apply the correction only in `v6`.
4. Repeat validation, preview deployment, and QA.

Multiple candidate versions during QA are normal and prevent immutable-cache confusion.

## 16. Promote an approved release

After the exact candidate deployment passes QA:

```sh
git switch main
git pull --rebase
git merge dev
git push origin main
```

Wait for the production Cloudflare deployment, then verify:

```text
https://rccportal.pages.dev/releases/v5/release.js
https://rccportal.pages.dev/releases/v5/shared.css
https://rccportal.pages.dev/releases/v5/portal-home.css
https://rccportal.pages.dev/releases/v5/portal-home.js
https://rccportal.pages.dev/releases/v5/community.css
https://rccportal.pages.dev/releases/v5/community.js
```

## 17. Point GHL to production

Update the GHL loader from the preview hostname to production:

```javascript
var release = "v5";
var releaseUrl =
  "https://rccportal.pages.dev/releases/" +
  release +
  "/release.js";
```

Open another clean incognito session and repeat the essential Portal Home, Community, and changed-page smoke tests.

## 18. Roll back if necessary

Do not delete or modify the problematic published release. Change the GHL loader back to the last known-good production version:

```javascript
var release = "v4";
var releaseUrl =
  "https://rccportal.pages.dev/releases/" +
  release +
  "/release.js";
```

Open a clean session and confirm the rollback.

## Quick completion checklist

- [ ] New complete release directory created
- [ ] Release identifiers updated
- [ ] Changes placed in the correct surface files
- [ ] Page detection adds and removes classes safely
- [ ] JavaScript syntax checks pass
- [ ] Candidate diff reviewed
- [ ] Candidate committed and pushed to `dev`
- [ ] Cloudflare preview deployment succeeds
- [ ] All six release assets return HTTP 200
- [ ] Existing GHL loader backed up
- [ ] Candidate loaded from deployment-specific hostname
- [ ] General and activity-specific QA pass
- [ ] Approved candidate merged into `main`
- [ ] Production assets verified
- [ ] GHL loader changed to the production hostname
- [ ] Production smoke test passes
- [ ] Previous release remains available for rollback
