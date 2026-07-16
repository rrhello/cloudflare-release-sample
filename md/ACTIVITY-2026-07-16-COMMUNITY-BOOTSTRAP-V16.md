# v16 — Community Bootstrap Transition Ownership

## Trace-confirmed cause

The v15 trace showed that `/communities` was revealed at 1148 ms, but GHL did
not automatically redirect to the default group until 1829 ms. That exposed the
intermediate community landing DOM for about 680 ms.

Each actual group route also started the loader twice:

1. `community.js` dispatched `rcc:loading-start`;
2. the shared release history wrapper saw the same `pushState` and started a
   second transition.

## Fix

- `/communities` remains covered for up to 2.2 seconds while waiting for GHL's
  default-group redirect.
- The existing 2.4-second community bound and five-second global fail-safe still
  prevent indefinite loading if the redirect never occurs.
- `community.js` now resets its internal readiness state directly without
  dispatching another global loading event.
- The shared loader owns the visible veil for URL changes.
- If a route change occurs while the veil is already active, the current
  transition is reused instead of creating another transition ID and resetting
  the timer.
- v15 diagnostics remain enabled for verification.

Expected Bento transition:

```text
Bento home → one continuous loading veil → final group route
```
