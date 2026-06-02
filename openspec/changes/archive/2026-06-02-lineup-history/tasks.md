## 1. Hook and Types

- [x] 1.1 Create `apps/web/src/hooks/useLocalStorage.ts` — generic SSR-safe hook: initialize state with `defaultValue`, read from localStorage in `useEffect` after mount, expose `[value, setValue]` tuple where `setValue` writes to both state and localStorage
- [x] 1.2 Create `apps/web/src/lib/lineup-history.ts` — define and export `SavedLineup` interface: `{ id: string; savedAt: string; input: LineupInput; result: LineupResult }`

## 2. Storage Module

- [x] 2.1 Implement `loadHistory(): SavedLineup[]` — read `lineup_history` from localStorage, parse JSON, return empty array on missing key or parse error
- [x] 2.2 Implement `saveLineup(input: LineupInput, result: LineupResult): void` — build new `SavedLineup` with `id = Date.now().toString()` and `savedAt = new Date().toISOString()`; overwrite existing entry if `normalized(teamName) + date` matches, otherwise prepend; write back to localStorage
- [x] 2.3 Implement `deleteLineup(id: string): void` — filter out the matching entry and write back to localStorage; no-op if id not found
- [x] 2.4 Add overwrite key comparison helper: normalize team name with `.trim().toLowerCase()`, compare with `existing.input.teamName.trim().toLowerCase() === incoming.trim().toLowerCase() && existing.input.date === date`

## 3. Page — Auto-Save on Generate

- [x] 3.1 In `apps/web/src/app/lineup/page.tsx`, import `saveLineup` from `lineup-history`
- [x] 3.2 In `generate()`, after `setResult(res)` and before `setStep("result")`, call `saveLineup(input, res)` — only when `res.assignments.length > 0` (skip saving if no valid assignments produced)

## 4. Page — Shared Load Helper

- [x] 4.1 Extract the "apply input to form state + route" logic from `handleImport()` into a standalone function `applyLineupInput(input: LineupInput): void` — sets all form state fields (roster, teamName, gameDate, innings, outfieldFormat, pitchers, catchers, lockedFields) and routes based on completeness (same logic as current `handleImport` after parse)
- [x] 4.2 Refactor `handleImport()` to call `applyLineupInput` after parsing, removing the duplicated state-setting and routing code

## 5. Page — History State and UI

- [x] 5.1 Add `history` state using the `useLocalStorage` hook: `const [history, setHistory] = useLocalStorage<SavedLineup[]>("lineup_history", [])`
- [x] 5.2 Implement `handleLoad(saved: SavedLineup)` — calls `applyLineupInput(saved.input)`
- [x] 5.3 Implement `handleDelete(id: string)` — calls `deleteLineup(id)`, then updates local `history` state to reflect the deletion immediately (avoids a re-read from localStorage)
- [x] 5.4 Render "Previous lineups" section above the step indicator: only when `history.length > 0`; each row shows team name + formatted date (e.g., "Green Sox · Jun 7, 2026"), a "Load" button, and a × button
- [x] 5.5 Format the date for display: `new Date(saved.input.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })`

## 6. Verification

- [x] 6.1 TypeScript type check passes with no errors
- [x] 6.2 Generate a lineup — confirm an entry appears in the "Previous lineups" section after navigating back to step 1 or refreshing
- [x] 6.3 Generate a second lineup with the same team + date — confirm entry count stays the same (overwrite)
- [x] 6.4 Click Load on a saved entry — confirm form state restores and auto-generates if complete
- [x] 6.5 Click × on a saved entry — confirm it disappears immediately
- [x] 6.6 Delete all entries — confirm the "Previous lineups" section disappears
