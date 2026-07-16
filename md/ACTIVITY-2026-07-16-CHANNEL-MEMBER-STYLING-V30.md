# v30 — Persistent Channels and Member Styling

## Changes

- The sidebar supplement has persistent white styling, no inherited 58px top
  margin, and reduced spacing above the channel list.
- Channel rows receive balanced top/bottom padding and retain full-width
  separators and sage hover feedback.
- The member route receives a dedicated body state.
- Member list content has outer padding and controlled horizontal bleed.
- Member avatars bleed to the card edges, span the card content height, and use
  proportional `object-fit: cover`.
- Member names and selected secondary variants use the sage palette.
- Member status tabs are muted when inactive and use a sage background, border,
  and text when active.

## QA

Verify channel persistence across routes, member list padding/bleed, proportional
avatar crops, sage text accents, and active/inactive member status tabs.
