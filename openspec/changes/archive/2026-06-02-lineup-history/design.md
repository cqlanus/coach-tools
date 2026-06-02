## Context

The lineup page is a `"use client"` Next.js component. All state lives in React component state. The `generate()` function already constructs a complete `LineupInput` and receives a `LineupResult` — both are plain serializable JSON. localStorage is the right fit: no backend, no auth, available immediately, survives page refreshes and browser restarts.

The existing `handleImport()` function already handles the "restore form state + route based on completeness" logic. Loading from history reuses this same pattern.

## Goals / Non-Goals

**Goals:**
- Auto-save every `generate()` call to localStorage
- Overwrite when team name + date match an existing entry; otherwise append
- Display history above the 3-step form: team name, date, Load, delete
- Load restores full `LineupInput` into form state and routes identically to `handleImport`
- SSR-safe hook to avoid hydration mismatches
- Store both `LineupInput` and `LineupResult` per entry

**Non-Goals:**
- Custom naming or labeling of saved lineups (future)
- Summary preview of rotation in the history list (future)
- Cross-device sync or server-side storage
- Pagination or search through history
- Storage quota management (entries are ~3-5KB each; limit is not a practical concern)

## Decisions

**D1: Data shape**

```typescript
interface SavedLineup {
  id: string;           // Date.now().toString() — unique per save
  savedAt: string;      // ISO timestamp for display ("saved 10:23am")
  input: LineupInput;   // full form input — used for load/restore
  result: LineupResult; // generated result — stored for future preview use
}
```

localStorage key: `"lineup_history"`, value: `SavedLineup[]` sorted newest-first.

**D2: Overwrite key = normalized(teamName) + date**

Overwrite condition: `existing.input.teamName.trim().toLowerCase() === newInput.teamName.trim().toLowerCase() && existing.input.date === newInput.date`. This prevents duplicates when re-generating for the same game while still keeping distinct entries for different games.

Alternative considered: overwrite by team + date + innings + outfield (more specific). Rejected — a coach tweaking the pitching rotation for the same game should get one history entry, not several.

**D3: SSR-safe `useLocalStorage` hook**

Next.js renders components on the server where `window` is undefined. The hook initializes state with `null` (or a provided default) and reads from localStorage only in a `useEffect` after mount. Writes are synchronous (localStorage is always available client-side after mount).

```typescript
function useLocalStorage<T>(key: string, defaultValue: T): [T, (val: T) => void]
```

**D4: History module separate from page**

CRUD logic lives in `apps/web/src/lib/lineup-history.ts` — not inline in the page component. Functions: `saveLineup(input, result)`, `loadHistory()`, `deleteLineup(id)`. This keeps the page component focused on UI and makes the storage logic independently understandable.

**D5: History section placement — above the 3-step form**

Visible immediately when a coach returns to `/lineup`. They see their previous lineups before anything else, making "load last week's lineup" the path of least resistance. Collapsible if the list gets long, but the list itself is compact (one line per entry).

**D6: Load reuses `handleImport` logic, not `handleImport` itself**

`handleImport` reads from `importText` state and calls `parseLineupFile`. Loading from history skips parsing entirely — the data is already structured. A separate `loadFromHistory(saved: SavedLineup)` function applies the `SavedLineup.input` directly to form state using the same merge + route logic, factored into a shared helper `applyLineupInput(input: LineupInput)`.

**D7: lockedFieldPositions → LockRow[][] conversion on load**

`LineupInput.lockedFieldPositions` is `Array<Record<string, string>>`. The page's `lockedFields` state is `LockRow[][]`. The conversion on load: `lockedFieldPositions[i]` → `Object.entries(...).map(([pos, player]) => ({ pos, player }))`. This is the same conversion already used in `handleImport`.

## Risks / Trade-offs

[Hydration mismatch] If history is read during render instead of after mount, Next.js SSR/CSR mismatch occurs. → Mitigation: `useLocalStorage` initializes with `[]` (empty) and populates in `useEffect`.

[History shows briefly empty on load] Because history is populated in `useEffect`, there's a flash where the history section shows nothing before data loads. → Acceptable: the section is secondary UI, not the primary interaction.

[Re-generate changes history] If a coach loads a saved lineup, tweaks the roster, and regenerates, the new result overwrites the old one (same team + date). → Intended and correct — the overwrite rule ensures one entry per game.

## Open Questions

None — all design decisions resolved during exploration.
