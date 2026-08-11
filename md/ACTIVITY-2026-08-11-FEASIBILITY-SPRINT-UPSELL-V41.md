# v41 — Feasibility Sprint Accelerator Upsell

- Adds a static Ownership Accelerator™ offer to the Feasibility Sprint Learning
  grid.
- Replaces the locked/native Accelerator course presentation on this route only;
  the RCC Feasibility Sprint course remains unchanged.
- Opens the Learn More offer in a new tab with `noopener noreferrer`.
- Removes the injected card and restores the native source when navigating away.
- Uses placement-specific attribution:

```text
https://go.residentialcarecollective.com/accelerator?utm_source=rcc_community_portal&utm_medium=referral&utm_campaign=feasibility_sprint_accelerator_upgrade&utm_content=learning_tab_upsell_card
```

## QA

Open `/communities/groups/rcc-feasibility-sprint/learning` and confirm exactly one
Accelerator offer appears before the Sprint course. Verify the image, copy,
keyboard focus, and Learn More presentation. Inspect the link and confirm the
full UTM query. Navigate to another group and back twice; the card must not
duplicate, and the native Accelerator course source must be restored outside the
target route.
