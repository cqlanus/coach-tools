## 1. Engine — Types and Data Model

- [x] 1.1 Add `Specialization` type to `lineup-engine.ts`: `{ position: string; targetInnings: number }`
- [x] 1.2 Add optional `specializations?: Specialization[]` field to the `Player` interface
- [x] 1.3 Add `SpecializationResult` type: `{ player: string; position: string; target: number; achieved: number }`
- [x] 1.4 Add `specializationResults: SpecializationResult[]` field to `LineupResult` interface

## 2. Engine — Soft Lock Injection

- [x] 2.1 In `generateLineup()`, before the inning loop, build a `specAchieved` tracking map: `Record<string, Record<string, number>>` (player → position → count)
- [x] 2.2 For each inning, compute eligible soft locks: iterate players with specializations, check available (not P/C/bench), target not yet met, position not already hard-locked
- [x] 2.3 For each eligible player, select the highest-priority specialization (most remaining needed; tie → first listed)
- [x] 2.4 When two players compete for the same position, select the one with more remaining (tie → lower batting order index)
- [x] 2.5 Merge computed soft locks into `lockedThisInning` before passing to `tryAssign()`
- [x] 2.6 After each inning's result is computed, increment `specAchieved[player][position]` for each soft-lock assignment that was fulfilled

## 3. Engine — Result Scoring and Fulfillment

- [x] 3.1 After all innings, compute `specializationResults` by reading `specAchieved` against each player's targets
- [x] 3.2 Adjust `repeats` counter: when tallying repeats in `fullHistory`, exclude position repetitions that correspond to fulfilled specialization innings (player played that position via soft lock)
- [x] 3.3 Include `specializationResults` in the returned `LineupResult`

## 4. UI — Roster Step (Step 1) — Specialization Editor

- [x] 4.1 Add `specializations` field to the `Player` state in `page.tsx`: `Specialization[]`, defaulting to `[]`
- [x] 4.2 Update `updatePlayer()` to handle specialization array changes
- [x] 4.3 Add `addSpecialization(playerIdx)` helper: appends `{ position: "", targetInnings: 2 }` to that player's specializations
- [x] 4.4 Add `removeSpecialization(playerIdx, specIdx)` helper
- [x] 4.5 Add `updateSpecialization(playerIdx, specIdx, field, value)` helper
- [x] 4.6 Render per-player specialization rows below the name/number fields in the roster list
- [x] 4.7 Each specialization row: position dropdown (field positions for active outfield format, excluding already-chosen positions for that player) + target selector (`[2, 3, 4]`) + × button
- [x] 4.8 Render "+ Add specialization" button per player (collapsed by default, appears only when clicked or when specializations already exist)

## 5. UI — Wire Specializations to Engine

- [x] 5.1 Pass `specializations` on each player when building `battingOrder` in `generate()`
- [x] 5.2 Pass `specializations` in the `downloadDocx()` API payload

## 6. UI — Result View — Fulfillment Summary

- [x] 6.1 After the summary row (Players / Innings / Repeats), render a specialization fulfillment section when `result.specializationResults.length > 0`
- [x] 6.2 Each fulfillment entry shows: player name, position, achieved/target, and a ✓ or shortfall indicator
- [x] 6.3 Shortfall entries are visually distinct (e.g., muted color) but no error state

## 7. Python API

- [x] 7.1 Add `Specialization` Pydantic model: `{ position: str, target_innings: int }`
- [x] 7.2 Add optional `specializations: list[Specialization] = []` field to `PlayerIn` model
- [x] 7.3 Thread specializations through `compute_lineup()` using the same soft lock injection logic as the TypeScript engine
- [x] 7.4 Compute and return `specialization_results` from `compute_lineup()` (not rendered in docx, but available for future use)
- [x] 7.5 Verify `.docx` output is unaffected — specialization appears only in final assignments, no special marking needed
