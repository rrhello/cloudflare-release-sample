# v17 — Provisional Group Home Redirect

## v16 trace finding

v16 kept `/communities` covered correctly and reused one transition. GHL then
followed this route sequence:

```text
/communities
→ /communities/groups/accelerator/home
→ /communities/groups/accelerator/private-group
```

The provisional `/home` route was revealed for approximately 716 ms before the
final private-group redirect.

## Change

When community loading begins at `/communities`, v17 marks the sequence as a
bootstrap. A group `/home` route must remain stable for 1.7 seconds before it
can be revealed. This covers the observed 1.437-second GHL redirect interval.
If `/home` is the real destination for a joined group, it is revealed after that
bounded stability window. If GHL redirects to `private-group`, the final route
uses the normal readiness check.

The existing 2.4-second community bound, five-second global fail-safe, and v15
diagnostics remain active.
