## Context

Umami provides two tracking mechanisms: automatic page views (via the script tag) and custom events (via `window.umami.track(eventName, properties)`). The script tag is loaded from `https://analytics.chrislanus.com/script.js` — a publicly accessible endpoint on the self-hosted Umami instance. Any visitor to `coach.chrislanus.com` from anywhere on the internet will have their events captured. The Umami dashboard at the same domain is protected by Umami's built-in authentication; the data is not publicly viewable.

Next.js requires using the `<Script>` component from `next/script` with `strategy="afterInteractive"` for third-party tracking scripts to avoid blocking hydration. The `data-website-id` attribute on the script tag identifies which Umami website receives events.

TypeScript doesn't know about `window.umami`. A minimal ambient type declaration avoids `any` casts.

## Goals / Non-Goals

**Goals:**
- Automatic page view tracking for all routes via the script tag
- Custom events at tier-2 depth for lineup and defense tools
- Graceful no-op when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is absent (dev environments, pre-Umami deployment)
- Events include relevant metadata as properties (player count, innings, scenario identifiers)

**Non-Goals:**
- Full funnel tracking / step abandonment rates (tier 3, future)
- Tracking other tools (practice, throwing, skills rubric) beyond page views — tier 1 covers those
- Server-side event tracking via the FastAPI

## Decisions

**D1: `next/script` with `strategy="afterInteractive"`**

Loads the Umami script after the page is interactive, not blocking initial render. The `src` points to the publicly accessible self-hosted instance: `https://analytics.chrislanus.com/script.js`. Alternative: `strategy="lazyOnload"`. Rejected — events fired shortly after page load might be missed.

**D2: Ambient type declaration for `window.umami`**

Add `apps/web/src/types/umami.d.ts` declaring `window.umami: { track: (event: string, data?: Record<string, unknown>) => void } | undefined`. Using optional chaining (`window.umami?.track(...)`) means the calls compile cleanly and silently no-op when the script hasn't loaded.

**D3: Defense scenario events fire on every selector change**

`defense-scenario-viewed` fires whenever `baseState` or `playType` changes — not just on initial load. This gives a frequency distribution of which scenarios coaches actually explore. Properties: `{ base, play }`. The event volume is low (manual selection changes), so no throttling is needed.

**D4: Lineup events fire at existing function call sites**

Events are placed inside existing functions (`generate()`, `downloadDocx()`, `handleImport()`, etc.) rather than in event handlers. This ensures events fire only on successful outcomes (e.g., `lineup-generated` only fires when the engine returns valid assignments, which is already gated).

**D5: Properties scoped to useful metadata only**

Event properties capture what's actionable in Umami's breakdown view:
- `lineup-generated`: `{ players, innings, repeats, has_locks, has_specs }` — enough to understand lineup complexity
- `defense-scenario-viewed`: `{ base, play }` — the full scenario key
- `defense-clip-clicked`: `{ scenario, example }` — which clip number (1, 2, or 3)

No PII is captured. No user identifiers.

## Risks / Trade-offs

[Script load failure] If `analytics.chrislanus.com` is unreachable, the script fails silently. Next.js does not render errors for failed `<Script>` loads. → No risk to the app.

[Umami website ID not set] If `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is empty, the script renders with an empty `data-website-id` and Umami ignores the events. → Silently no-ops in dev and pre-deploy.

[Event double-firing in React Strict Mode] React Strict Mode runs effects twice in development. Event calls inside `useEffect` could fire twice in dev. → Since events are placed in click handlers and function bodies (not effects), this doesn't apply.

## Open Questions

None.
