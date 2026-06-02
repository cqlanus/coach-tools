## Why

Coaches generate lineups repeatedly for the same roster across a season, but each visit to the tool starts from scratch. Persisting generated lineups in browser localStorage means a coach can return to a previous game's rotation, reload it as a starting point for the next game, or review what they used last week — all without any server-side storage or accounts.

## What Changes

- Add a `useLocalStorage` hook for SSR-safe localStorage access
- Auto-save every generated lineup to localStorage immediately after `generate()` succeeds; overwrite any existing entry with the same team name + date, otherwise append
- Add a "Previous lineups" section above the 3-step form on the lineup page, listing saved lineups with team name, date, a Load button, and a delete button
- Load restores the saved `LineupInput` into form state and routes to the appropriate step (auto-generates if complete, navigates to step 2 if partial)
- Each saved entry stores both the `LineupInput` (for re-loading) and the `LineupResult` (for future preview use)

## Capabilities

### New Capabilities

- `lineup-history-storage`: localStorage persistence of generated lineups — save, overwrite, delete, and list entries keyed by team + date
- `lineup-history-ui`: "Previous lineups" section above the form that displays saved entries and supports load/delete actions

### Modified Capabilities

<!-- none -->

## Impact

- `apps/web/src/hooks/useLocalStorage.ts` — new SSR-safe hook
- `apps/web/src/lib/lineup-history.ts` — new module for history CRUD operations and types
- `apps/web/src/app/lineup/page.tsx` — auto-save on generate, history UI section
