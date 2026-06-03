## Why

Coaches benefit from curated video references organized by skill category, but there's currently no place in the tool to surface them. Adding a Video Library page with embedded YouTube playlists gives coaches quick access to high-quality instructional content alongside the other tools — no context switching to find a specific drill or technique video.

## What Changes

- Add `/videos` route with a new "Video Library" page
- Add "Videos" entry to the TopNav
- Add `src/data/playlists.ts` containing the four playlist definitions with YouTube playlist IDs
- Tabbed UI with four categories: Hitting, Throwing & Pitching, Catching & Fielding, Situations
- Iframes are lazy-loaded: injected on first tab activation, then hidden/shown with CSS (avoids loading all four YouTube embeds on page render)
- Responsive 16:9 embed via Tailwind `aspect-video`

## Capabilities

### New Capabilities

- `video-library-page`: Tabbed YouTube playlist page at `/videos` with lazy-loaded responsive embeds and a static data file for playlist IDs

### Modified Capabilities

<!-- none -->

## Impact

- `apps/web/src/app/videos/page.tsx` — new page
- `apps/web/src/data/playlists.ts` — new static playlist data file
- `apps/web/src/components/ui/TopNav.tsx` — add Videos nav entry
