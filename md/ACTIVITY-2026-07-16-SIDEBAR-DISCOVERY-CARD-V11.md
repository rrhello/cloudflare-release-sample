# v11 — Sidebar Discovery Card and Route Loading Guard

## Changes

- Removed the Discover Channels modal, backdrop, close controls, and per-route
  dismissal state.
- Kept GHL's native Discover element mounted but visually hidden.
- Added a compact, minimum-height Discover Channels card as the last child of
  the injected Communities list in the left sidebar.
- Kept unjoined community tabs muted and Chat hidden while Join Group exists.
- Started the loading veil on community navigation pointer-down, before the SPA
  click handler can render an intermediate customized page.
- Removed the fixed 900 ms route timeout that could expose a partially rendered
  page.
- Delayed the ready signal until community DOM mutations settle for 240 ms;
  the existing five-second fail-safe still prevents a permanent loading veil.

## Sidebar structure

```text
Communities sidebar
└── .rcc-community-group-list
    ├── Communities heading
    ├── Community row
    ├── Community row
    └── #rcc-discovery-card
        ├── Lock icon
        ├── Discover Channels
        └── Join guidance
```

## Manual QA gate

1. Install the complete v11 immutable-preview loader.
2. Hard-refresh and navigate between community groups.
3. Confirm the loading veil appears before any intermediate custom or native
   layout and remains until the new community DOM settles.
4. Confirm no modal or backdrop is created.
5. Confirm the compact card is directly below the Communities rows and does not
   cover or squeeze the main content.
6. Confirm unjoined tabs remain muted and Chat remains hidden.
7. Regression-test joined communities, Bento home, course routing, and mobile.

Do not merge `dev` to `main` until manual QA passes.
