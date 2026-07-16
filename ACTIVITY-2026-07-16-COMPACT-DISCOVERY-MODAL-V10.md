# v10 — Compact Discover Channels Modal and Unjoined Controls

## QA feedback addressed

- The native Discover Channels panel appeared behind the overlay and looked
  blurred.
- The dialog occupied too much vertical space.
- Navigation tabs remained visually active before a user joined a private
  community, although those tabs were not usable.
- Chat remained visible on the same unjoined state.

## Implementation

The native Discover Channels element remains mounted for GHL compatibility but
is hidden from presentation. v10 injects a compact, accessible dialog directly
under `body`, outside GHL's sidebar stacking context. Its backdrop uses a solid
translucent color without `backdrop-filter`, so the dialog itself cannot inherit
the blurred appearance. Close button, outside click, and Escape dismiss it for
the current path.

When both `#joinGroup__btn` and `#container_group_about` exist, v10 treats the
page as an unjoined private community. It marks the community tab switchers as
disabled, removes them from keyboard focus, blocks pointer interaction, and
hides the Chat control. Normal controls are restored when the unjoined markers
are absent.

## Structure

```text
body.rcc-private-group-page
├── #app                         GHL remains mounted
│   └── native Discover panel   retained but visually hidden
├── #rcc-discovery-modal        compact body-level dialog
│   ├── Close button
│   ├── Lock icon
│   ├── Heading
│   └── Join guidance
└── #rcc-discovery-modal-backdrop
```

## Required manual QA

1. Install the full v10 early-guard loader from
   `GHL-ADVANCED-CUSTOM-JAVASCRIPT-V10.md` using the immutable preview host.
2. Hard-refresh an unjoined private group and confirm no native GHL flash.
3. Confirm the dialog is centered, compact, sharp, and above a non-blurred
   backdrop.
4. Close it by X, outside click, and Escape; confirm DOM updates do not reopen
   it on the same path.
5. Confirm Discussion, Learning, Events, Leaderboard, Members, and About appear
   muted and cannot be clicked while Join Group is present.
6. Confirm Chat is hidden while Join Group is present.
7. Confirm joined communities retain normal tabs and Chat.
8. Regression-test Bento home, course routing, sidebar communities, and mobile.

Do not merge `dev` to `main` until these checks pass.
