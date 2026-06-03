## Context

The coach-tools web app uses Next.js App Router with `"use client"` components for interactive pages. Existing pages follow a consistent pattern: TopNav + a main content card. This page is purely presentational — no API calls, no state beyond active tab — but requires `"use client"` for tab switching and lazy-load tracking.

## Goals / Non-Goals

**Goals:**
- Four-tab YouTube playlist page matching the existing visual design system
- Lazy-load iframes (inject on first activation, persist with CSS hide/show)
- Responsive 16:9 aspect ratio on all screen sizes
- Static playlist data file that's easy to update without touching the component

**Non-Goals:**
- Server-side rendering of embed content
- Individual video browsing or search within playlists
- Custom video player controls beyond what YouTube provides
- Playlist metadata fetched from YouTube API

## Decisions

**D1: Playlist data in `src/data/playlists.ts`, not inline**

A separate data file means adding or reordering playlists only requires editing one file. The component stays stable. Each entry: `{ id, label, playlistId }`.

**D2: Lazy load via `loadedTabs: Set<string>` state**

On first click of a tab, its `id` is added to `loadedTabs`. The iframe is only rendered when `loadedTabs.has(id)`. After initial render, visibility is toggled via `display: none` / `display: block` (or Tailwind `hidden` / block), not by unmounting — this preserves the YouTube player state (current position, volume) when switching tabs.

**D3: Responsive embed via `aspect-video` wrapper**

Tailwind's `aspect-video` class applies `aspect-ratio: 16 / 9`. The iframe fills 100% width and 100% height of the wrapper, scaling naturally on all screen sizes. No padding-bottom hack needed.

**D4: YouTube `videoseries` embed format**

`https://www.youtube.com/embed/videoseries?list={PLAYLIST_ID}` loads the full playlist player — coaches can watch a video and the player automatically queues the next. Additional params: `rel=0` (suppress unrelated recommendations at end).

**D5: Default to first tab loaded on initial render**

The first tab (`hitting`) is activated by default so something is immediately visible without requiring a click. Its iframe is included in `loadedTabs` initial state.

## Risks / Trade-offs

[YouTube embed availability] If YouTube changes embed policies or a playlist is made private, the embed fails silently (blank iframe). → Mitigation: coach controls the playlists; easy to update IDs in the data file.

[Four iframes loading at once if user rapidly tabs] The lazy-load prevents this for normal use — each iframe only loads once per session. → No further mitigation needed.

## Open Questions

None.
