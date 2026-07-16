# v14 — Prevent Intermediate Discovery Card Paint

## QA observation

The compact Discover Channels card briefly appeared between the community
sidebar and main content before the full-screen loader took over.

## Changes

- The loading veil's inline CSS now hides the Discover card without depending
  on the external community stylesheet.
- The early GHL Custom CSS guard also hides the card before external JavaScript.
- Community loading starts from capture-phase pointer navigation and
  keyboard-generated clicks for group rows, native group buttons, and group
  links.
- A previous-route Discover card is removed immediately when loading begins.
- The card is not created during route reconstruction. It is inserted only
  after the destination surface passes the bounded ready check and immediately
  before the veil is removed.

## Manual QA

Install both v14 snippets and hard-refresh before testing. Navigate repeatedly
between joined and unjoined groups. Confirm the transition is:

```text
current page → loading veil → completed destination page
```

There should be no intermediate Discover card, squeezed layout, or permanent
loading veil. Do not merge `dev` into `main` until this passes.
