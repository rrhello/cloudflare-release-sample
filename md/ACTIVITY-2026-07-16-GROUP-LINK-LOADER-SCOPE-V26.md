# v26 — Scope Loader to Actual Group Switches

## Evidence from v25 QA

The hit-test traces showed:

```text
event:rcc-loading-start
community:loading-start
community:interaction-hit
topmost: html.rcc-release-loading
```

This occurred when clicking featured posts, normal posts, and channel content
while the current URL remained on the same channel route.

## Root cause

The release capture listener matched every anchor whose URL contained
`/communities/groups/`. That pattern includes group tabs, channels, posts, and
other normal community content. It started the full-screen loading veil during
`pointerdown`, before GHL received the completed click.

## Fix

The capture listener is now restricted to GHL's actual hidden group-switch rail:

```text
.rcc-source-group-button
.rcc-source-group-rail [role="button"]
```

Custom sidebar rows continue to manage their own loader lifecycle. Ordinary
Discussion, Learning, Events, channel, post, comment, and content links no
longer start the group-switch veil. Real SPA route changes remain covered by the
history hooks after GHL initiates navigation.

## QA

Test:

- Discussion, Learning, Events, and other group tabs
- Featured and normal posts
- Post details and comments
- Reactions and feed controls
- Switching groups from the custom sidebar

Only actual group switching should show the pre-navigation loading veil.
