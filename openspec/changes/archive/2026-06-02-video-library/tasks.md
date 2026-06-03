## 1. Data File

- [x] 1.1 Create `apps/web/src/data/playlists.ts` exporting a `PLAYLISTS` array with four entries: `{ id: string; label: string; playlistId: string }` — Hitting (`PLiyH4Ka2W-FXkQoos-B2TDIkKjLYCpgnA`), Throwing & Pitching (`PLiyH4Ka2W-FV0SZOK0Fu1CI77cCYW-p5z`), Catching & Fielding (`PLiyH4Ka2W-FWGS97QBBzSPv-T4r3CZIYL`), Situations (`PLiyH4Ka2W-FUkJrWbj1GLrl3wyl4K3hwP`)

## 2. Page Component

- [x] 2.1 Create `apps/web/src/app/videos/page.tsx` as a `"use client"` component
- [x] 2.2 Import `TopNav`, `PLAYLISTS` from data file
- [x] 2.3 Add `activeTab` state (string, default `PLAYLISTS[0].id`) and `loadedTabs` state (`Set<string>`, initialized with `new Set([PLAYLISTS[0].id])`)
- [x] 2.4 Implement tab click handler: set `activeTab` to clicked id and add id to `loadedTabs`
- [x] 2.5 Render page header: section label "Tool", `<h1>` "Video Library", subtitle "Curated coaching videos organized by topic."
- [x] 2.6 Render tab buttons row: one button per playlist, active state styled with `bg-red/80 text-cream`, inactive with `bg-white/5 text-cream/50`
- [x] 2.7 For each playlist, render a container that is visible only when `activeTab === playlist.id`; inside, render the iframe only when `loadedTabs.has(playlist.id)`
- [x] 2.8 iframe: `src=https://www.youtube.com/embed/videoseries?list={playlistId}&rel=0`, `allowFullScreen`, `title={playlist.label}`, `className="w-full h-full border-0"` inside a `div` with `className="aspect-video w-full rounded-xl overflow-hidden"`

## 3. TopNav

- [x] 3.1 Add `{ href: "/videos", label: "Videos", icon: "🎬" }` to the `tools` array in `apps/web/src/components/ui/TopNav.tsx`

## 4. Verification

- [x] 4.1 TypeScript type check passes: `npx tsc --noEmit`
- [ ] 4.2 All four tabs render and switch correctly; only the active playlist is visible
- [ ] 4.3 On first click of each tab, the iframe loads; on subsequent switches back, the player state is preserved
- [ ] 4.4 Embed is responsive — resize browser to confirm 16:9 ratio is maintained
