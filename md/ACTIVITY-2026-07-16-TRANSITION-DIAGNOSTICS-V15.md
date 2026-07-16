# v15 — Bento-to-Community Transition Diagnostics

## Working hypothesis

The Bento Community action crosses the portal-home surface and GHL's community
SPA. More than one navigation phase can emit loading and ready events. A ready
event from the departing surface may reveal an intermediate community DOM, and
a later loading event may start a second veil without the expected matching
completion.

## Diagnostic instrumentation

v15 keeps a rolling in-memory trace of up to 250 entries:

- loader show, hide request, hidden state, reason, and transition ID;
- Bento native-control lookup and click;
- `pushState`, `replaceState`, `popstate`, and whether the URL changed;
- detected surface changes;
- RCC loading and surface-ready events;
- CSS and JavaScript asset success or failure;
- community readiness inputs, bounded fallback use, and navigation mutations;
- current path, ready flag, loading class, and active surface.

Use `rccDebugReport()` immediately after a successful transition, double flash,
or stuck loader. Diagnostics are intentionally limited to structural state and
do not collect user-generated content or credentials.
