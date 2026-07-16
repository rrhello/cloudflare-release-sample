# v34 — Channel States, Featured Cards, and Group Navigation

## Changes

- Channel rows use a transparent default surface with dark text.
- Hover and keyboard focus use a light-gray surface.
- The active channel uses the light-sage surface with dark-green icon and text.
- The same semantic selectors apply to the injected channel supplement on every
  group route.
- Featured carousel slides, links, cards, and inner containers share a fixed
  350px height.
- Featured titles and descriptions use multi-line ellipsis clamps, and the
  reaction footer remains pinned to the bottom of each card.
- The active group navigation tab uses dark branded text with a sage underline.

## QA

Check group home, a channel, learning, events, leaderboard, members, and about.
Confirm the channel list does not visually change between routes. On group home,
confirm featured cards have equal heights with no text escaping below the
reaction footer. Confirm the selected top navigation tab has dark text and the
correct underline.
