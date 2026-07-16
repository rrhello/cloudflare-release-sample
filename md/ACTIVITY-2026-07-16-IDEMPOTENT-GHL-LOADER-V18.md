# v18 — Idempotent GHL Loader

## v17 trace finding

The trace ended with `loader:hidden`, `ready:true`, and `loading:false` at
360 ms. The report snapshot taken later showed `ready:false` and `loading:true`
without any subsequent trace event.

This proves GHL re-executed the Advanced Custom JavaScript snippet after the
external release had finished. The old snippet performed these actions in the
wrong order:

1. set `data-rcc-ready="false"`;
2. add `rcc-release-loading`;
3. detect the existing release script;
4. return.

That left the loading veil active with no external initialization left to remove
it. The re-execution could not appear in the trace because it returned before
calling external v17 code.

## Fix

The v18 GHL snippet checks for its existing release script before changing any
readiness or loading state. Repeated execution is therefore a no-op.

The Cloudflare assets otherwise retain v17's provisional group-route handling
and transition diagnostics.
