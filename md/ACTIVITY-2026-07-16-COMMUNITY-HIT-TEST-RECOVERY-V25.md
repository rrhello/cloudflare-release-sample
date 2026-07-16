# v25 — Community Hit-Test Recovery

## Investigation

The QA symptom affects multiple independent controls while Create Post remains
available. This indicates inherited SPA interaction state or a stale transition
layer rather than a broken individual click handler.

## Fix

- Joined group reconciliation removes stale `inert`, `aria-disabled`, muted-tab,
  and inline pointer-event state from navigation and feed scopes.
- Joined community navigation, posts, inputs, textareas, and button-like
  controls explicitly regain pointer interaction.
- If the release loading class survives after the custom layout is ready, its
  full-screen pseudo-elements are hidden and the native app is made visible.
- Capture-phase hit-test diagnostics record the intended region, event target,
  browser topmost element, pointer-events, z-index, and joined/private state.

## QA

Test Discussion, Learning, Events, post links, comments, reactions, and other
feed controls. If any control remains blocked, click it and immediately paste:

```javascript
rccDebugReport()
```

Look for `community:interaction-hit` entries near the end of the report.
