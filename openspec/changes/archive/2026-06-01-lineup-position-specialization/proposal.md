## Why

The lineup generator currently optimizes for maximum position variety, but youth coaches also need the opposite: intentionally repeating a player at a specific position across multiple innings to accelerate skill development and begin position specialization. There is no way to express this preference without hard-locking every inning manually.

## What Changes

- Add optional per-player specialization entries on the `Player` data model: a position and a target innings count (2, 3, or 4)
- Players may have multiple specialization entries (e.g., 2 innings at 1B and 2 innings at CF)
- The engine auto-injects soft locks for specialized players each inning they are available (not pitching, catching, or benched), up to their target count
- Bench equity is unaffected — bench planning runs before specialization soft locks are applied
- Result view gains a specialization fulfillment summary (achieved/target per player per position); shortfalls are shown but do not block generation
- The unintentional repeats counter excludes fulfilled specialization innings
- Step 1 (Roster) UI gains per-player specialization editor: add/remove position + target pairs inline
- Python API updated to accept specialization data and thread it through

## Capabilities

### New Capabilities

- `position-specialization`: Per-player, per-position target innings that guide the engine to prefer repeating that player at that position via soft locks, subject to bench equity and hard assignment priority

### Modified Capabilities

- `field-position-locks`: Specialization soft locks use the same injection mechanism as field position locks; the locks applied via specialization count toward the locked player's history the same way manually entered locks do

## Impact

- `apps/web/src/lib/lineup-engine.ts` — `Player` interface, `LineupInput`, `generateLineup()` pre-processing, result scoring
- `apps/web/src/app/lineup/page.tsx` — Step 1 roster UI
- `api/routers/lineup.py` — request schema and engine call
