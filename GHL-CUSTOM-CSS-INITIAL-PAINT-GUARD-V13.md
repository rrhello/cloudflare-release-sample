# GHL Custom CSS Initial-Paint Guard — v13

Add this small block to GHL's **Custom CSS** field. It must be saved in the
earliest global portal CSS location available, not inside the external
Cloudflare stylesheet.

```css
html:not([data-rcc-ready="true"]) #app {
  visibility: hidden !important;
}

html:not([data-rcc-ready="true"]),
html:not([data-rcc-ready="true"]) body {
  background: #f4f4f4 !important;
}
```

Why this is separate: GHL can paint `#app` before Advanced Custom JavaScript or
Cloudflare's `release.js` executes. CSS loaded by GHL before that paint is the
only reliable place to suppress those initial pixels. v13 changes
`data-rcc-ready` to `true` when the customized surface is ready, including the
five-second recovery path.

Keep the v13 Advanced Custom JavaScript loader installed with this CSS. Using
the CSS without the v13 loader would leave the app hidden.
