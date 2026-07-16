# v13 — Joined Group Loader and Initial Paint Guard

## Root causes addressed

GHL can call `replaceState` for internal state without changing the URL. Earlier
releases treated every call as navigation, repeatedly restarting the loading
veil. Joined-group tab controls could also start the veil on pointer-down even
when no route-completion event followed.

The remaining initial flash happens before external JavaScript executes. It
cannot be eliminated by changing Cloudflare assets alone.

## Changes

- `pushState` and `replaceState` start community loading only when their resolved
  URL differs from the current URL.
- Joined-group tab switchers no longer trigger the pointer-down veil.
- The loader publishes `data-rcc-ready="true"` when the surface or fail-safe is
  ready.
- A companion early GHL Custom CSS guard hides `#app` before the Advanced Custom
  JavaScript and Cloudflare assets execute.

## Manual QA

Install both v13 snippets, then test hard refreshes and repeated navigation on
joined `/communities/groups/GROUP_NAME/home` routes. Confirm the initial old
style does not paint, tab navigation does not trap the loader, genuine URL
changes still show the veil, and the five-second recovery still reveals the app
if an asset is blocked.

Do not merge `dev` into `main` until manual QA passes.
