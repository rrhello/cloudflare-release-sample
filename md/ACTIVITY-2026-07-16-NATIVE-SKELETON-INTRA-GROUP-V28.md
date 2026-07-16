# v28 — Native Skeleton for Intra-Group Navigation

## Behavior

- Initial application/community boot keeps the custom loader.
- Entering or leaving the community surface keeps the custom loader.
- Switching from one group slug to another keeps the custom loader.
- Navigation that stays within the same group uses GHL's native loading state.

Same-group navigation includes Discussion, Learning, Events, Leaderboard,
About, channels, posts, comments, and browser back/forward between those routes.

## Implementation

Both the global release history hook and the community-specific history hook
compare the source and target group slug before starting custom loading.
Same-group route changes are recorded as `loader:native-skeleton` and
`community:native-skeleton-route` without changing custom ready/loading state.

The custom sidebar group click retains its explicit loader because it represents
an actual group switch.

## QA

Confirm:

- direct initial community load uses the custom loader;
- Home to Community uses the custom loader;
- Group A to Group B uses the custom loader;
- tabs, Events, Leaderboard, channels, posts, and comments within Group B do not
  show the white screen;
- browser back/forward inside the same group also uses GHL's native skeleton.
