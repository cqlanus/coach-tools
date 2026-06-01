## 1. Engine — Types and Data Model

- [x] 1.1 Add `lockedFieldPositions: Array<Record<string, string>>` to `LineupInput` interface in `lineup-engine.ts` (optional, defaults to empty)
- [x] 1.2 Update `generateLineup()` to accept and normalize `lockedFieldPositions` (default to array of empty objects if omitted)

## 2. Engine — Core Assignment Logic

- [x] 2.1 In the inning loop, extract locked positions and locked players from `lockedFieldPositions[i]`
- [x] 2.2 Filter `orderedPos` to exclude locked position keys before passing to `tryAssign()`
- [x] 2.3 Filter `fieldPlayers` to exclude locked player values before passing to `tryAssign()`
- [x] 2.4 Pre-seed `tryAssign()` initial `result` and `assigned` arguments with locked entries
- [x] 2.5 Verify merged result includes locked assignments in history tracking (should work automatically via existing `Object.entries(result)` loop)

## 3. Engine — Bench Planning

- [x] 3.1 Add `lockedField: Array<Record<string, string>>` parameter to `planBench()` signature
- [x] 3.2 In `planBench()`, add locked players to per-inning exclusions (same as pitcher/catcher)
- [x] 3.3 Increment `duties` for locked field players (count each locked inning as a duty)
- [x] 3.4 Update the `generateLineup()` call to `planBench()` to pass `lockedFieldPositions`

## 4. Engine — Conflict Detection

- [x] 4.1 Add conflict check: locked player equals pitcher for that inning → push to `conflictErrors`
- [x] 4.2 Add conflict check: locked player equals catcher for that inning → push to `conflictErrors`
- [x] 4.3 Add conflict check: same player locked to multiple positions in same inning → push to `conflictErrors`

## 5. UI — State and Step 2 Layout

- [x] 5.1 Add `lockedFields` state: `Array<Record<string, string>>` initialized as `Array.from({ length: 6 }, () => ({}))`
- [x] 5.2 Sync `lockedFields` array length to `innings` in `goToAssignments()` (same pattern as `pitchers`/`catchers`)
- [x] 5.3 Update step label from "P & C" to "Positions" in the step indicator
- [x] 5.4 Update the "Next" button label to match

## 6. UI — Lock Row Component (inline)

- [x] 6.1 Render existing lock rows per inning below pitcher/catcher selectors
- [x] 6.2 Add "+ Lock a position" button per inning that adds an empty `""→""` entry to `lockedFields[i]`
- [x] 6.3 Render position dropdown per lock row — options from `FIELD_POSITIONS[fieldKey]`, excluding positions already locked in that inning
- [x] 6.4 Render player dropdown per lock row — options from `playerNames`, excluding pitcher, catcher, and players already locked in that inning
- [x] 6.5 Render × button per lock row that removes the entry from `lockedFields[i]`
- [x] 6.6 Handle position change in a lock row (re-key the map entry: remove old position, add new one)
- [x] 6.7 Handle player change in a lock row (update value for that position key)

## 7. UI — Conflict Display

- [x] 7.1 Compute per-inning field lock conflicts (locked player = pitcher or catcher) and display inline below lock rows
- [x] 7.2 Include field lock conflicts in the `generate()` guard (block generation if any exist)

## 8. UI — Wire to Engine

- [x] 8.1 Pass `lockedFieldPositions: lockedFields.slice(0, innings)` in the `LineupInput` passed to `generateLineup()`

## 9. Python API

- [x] 9.1 Add optional `locked_field_positions: list[dict[str, str]] | None` field to the API request schema in `api/routers/lineup.py`
- [x] 9.2 Pass the value (defaulting to empty list) through to the Python lineup engine call
- [x] 9.3 Verify `.docx` output is unaffected — final assignments already include locked positions implicitly
