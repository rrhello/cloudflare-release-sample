# GHL Custom CSS Initial-Paint Guard — v14

Keep this in GHL's earliest global Custom CSS field:

```css
html:not([data-rcc-ready="true"]) #app {
  visibility: hidden !important;
}

html:not([data-rcc-ready="true"]) #rcc-discovery-card {
  display: none !important;
}

html:not([data-rcc-ready="true"]),
html:not([data-rcc-ready="true"]) body {
  background: #f4f4f4 !important;
}
```

Use this only with the v14 Advanced Custom JavaScript loader, which sets
`data-rcc-ready="true"` after the customized surface is ready.
