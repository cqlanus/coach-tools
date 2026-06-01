## Why

Pitcher and catcher are the only positions coaches can pre-assign in the lineup generator, but real games often require locking other specialized positions—especially first base, and sometimes shortstop or third base—to specific players per inning. The engine currently auto-rotates all field positions, leaving no way to express these constraints.

## What Changes

- Add optional per-inning field position locks to the lineup input (any position except P/C)
- Extend the assignment step UI with inline lock rows: position dropdown + player dropdown + remove button
- Update the rotation engine to exclude locked players/positions from auto-assignment and bench planning
- Expand conflict detection to catch locked-player-vs-pitcher/catcher and duplicate lock conflicts
- Thread locked field positions through the Python API for `.docx` export (final assignments only, no special marking)

## Capabilities

### New Capabilities

- `field-position-locks`: Per-inning optional locking of any field position (1B, 2B, 3B, SS, LF, CF, RF, LC, RC depending on outfield format) to a specific player, integrated into the rotation engine's assignment and bench planning logic

### Modified Capabilities

<!-- none -->

## Impact

- `apps/web/src/lib/lineup-engine.ts` — `LineupInput` type and `generateLineup()` / `planBench()` logic
- `apps/web/src/app/lineup/page.tsx` — step 2 UI (assignments screen)
- `api/routers/lineup.py` — request body schema and engine call
