## Context

The lineup engine has two tiers of position assignment: locked (pitcher/catcher, required per inning) and auto-assigned (all field positions via `tryAssign()`). Coaches need a third tier: optional field position locks that pre-assign a player to a specific position before auto-assignment runs.

The engine's `tryAssign()` already accepts a pre-seeded `result` map and an `assigned` set—the locked field positions can be injected there without modifying the function itself. The main work is in the calling code (`generateLineup`) and in `planBench()`, which must learn to exclude locked players from bench candidacy.

## Goals / Non-Goals

**Goals:**
- Allow coaches to lock any field position (format-aware: 1B/2B/3B/SS/LF/CF/RF or LF/LC/RC/RF variants) to a specific player per inning
- Locks are optional—omitting them leaves the engine's auto-assignment unchanged
- Conflict detection covers locked-player-vs-pitcher/catcher and duplicate locks
- The Python API accepts and threads locked positions through; final output is unchanged in format

**Non-Goals:**
- Whole-game locks (all-inning shortcut) — per-inning control is sufficient
- Visual distinction of locked vs auto-assigned positions in `.docx` output
- Locking pitcher or catcher via this new mechanism (those remain their own dedicated UI)

## Decisions

**D1: Data shape — `Array<Record<string, string>>` indexed by inning**

`lockedFieldPositions: Array<Record<string, string>>` where index = inning (0-based) and each entry maps position → player name. Mirrors the existing `field: Record<string, string>` shape in `InningAssignment` output, so the engine can treat locked assignments and auto-assignments uniformly in history tracking.

Alternative considered: flat `Array<{inning, position, player}>`. Rejected—requires filtering by inning on every access, and the map form is a direct fit for the pre-seeded result pattern.

**D2: `tryAssign()` unchanged — inject via inputs, not internals**

Pass locked positions to `tryAssign()` by:
1. Filtering `orderedPos` to exclude locked position keys
2. Filtering `fieldPlayers` to exclude locked player values
3. Pre-seeding the initial `result` and `assigned` arguments with locked entries

This keeps the recursive function pure and unchanged. Locked positions appear naturally in the merged result.

**D3: `planBench()` receives locked field data**

Signature extended: `planBench(..., lockedField: Array<Record<string, string>>)`. Per inning, players appearing in `lockedField[i]` are excluded from bench candidates (same exclusion logic as pitcher/catcher). Their innings also count toward `duties` so bench distribution remains fair.

**D4: Conflict detection at the UI layer, validated again in the engine**

UI surfaces errors inline (same pattern as pitcher === catcher today). Engine also emits `conflictErrors` for:
- Locked player equals that inning's pitcher or catcher
- Same player locked to two positions in the same inning

**D5: Position dropdown is format-aware**

Available lockable positions come from `FIELD_POSITIONS[fieldKey]` (the same constant the engine uses), filtered to exclude already-locked positions in that inning. This ensures LC/RC appear in 4-outfielder mode, CF in standard mode.

## Risks / Trade-offs

[Bench fairness edge case] A player locked to a field position across many innings accumulates field-playing duties, which reduces their bench frequency—potentially making bench distribution less even for other players. → Mitigation: the updated `duties` count in `planBench()` ensures locked players are deprioritized for remaining bench slots, balancing exposure.

[State initialization] `lockedFields` state is initialized as `Array(6).fill({})`. In React, `fill` with a reference type shares the same object. → Mitigation: initialize as `Array.from({ length: 6 }, () => ({}))` to ensure independent objects per inning.

[Python API parity] The Python API (`api/routers/lineup.py`) must accept the new field. If omitted by old clients, it defaults to empty locks (no behavior change). → Mitigation: default to empty array/dict in the request schema.

## Open Questions

None — all decisions made during exploration.
