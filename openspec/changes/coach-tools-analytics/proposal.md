## Why

The coach-tools site has no visibility into which tools coaches actually use or how deeply they engage with each feature. Adding Umami tracking (self-hosted, already deployed in the services change) gives page-level visibility for free and custom event tracking reveals actual feature usage — lineup generation rate, defense scenario preferences, export behavior — without any third-party data sharing.

## What Changes

- Add Umami tracking script to the Next.js app layout via `NEXT_PUBLIC_UMAMI_WEBSITE_ID` environment variable; gracefully no-ops if the variable is absent
- Add `umami.track()` calls at tier-2 depth across the lineup and defense tools:
  - Lineup: `lineup-generated`, `docx-exported`, `file-imported`, `lineup-loaded-from-history`, `lineup-exported-markdown`, `lineup-exported-org`
  - Defense: `defense-scenario-viewed`, `defense-clip-clicked`, `defense-search-clicked`

## Capabilities

### New Capabilities

- `site-analytics`: Umami script tag in layout providing automatic page view tracking and the `window.umami` API for custom events
- `lineup-event-tracking`: Custom event calls at key interaction points in the lineup generator
- `defense-event-tracking`: Custom event calls tracking scenario views and clip interactions in the defense tool

### Modified Capabilities

<!-- none -->

## Impact

- `apps/web/src/app/layout.tsx` — Umami script tag
- `apps/web/src/app/lineup/page.tsx` — event tracking calls
- `apps/web/src/app/defense/page.tsx` — event tracking calls
- `.env` / deployment environment — `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
