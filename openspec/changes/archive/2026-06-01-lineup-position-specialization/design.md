## Context

The lineup engine currently has two assignment tiers: hard locks (pitcher, catcher, field position locks) that are set before `tryAssign()` runs, and auto-assignment (all remaining field positions filled by the variety optimizer). Specialization needs a third tier — soft locks — that behave like hard locks but are generated automatically by the engine based on per-player preferences, and only injected while a player's target count is unmet.

The recently shipped `field-position-locks` feature provides the exact injection mechanism needed. Specialization soft locks are computed per inning, then merged into the same `lockedThisInning` map before `tryAssign()` runs. No changes to `tryAssign()` itself are required.

## Goals / Non-Goals

**Goals:**
- Allow per-player, per-position target innings (2, 3, or 4) configured at the roster level
- Multiple specializations per player (e.g., 1B × 2 and CF × 2 in the same game)
- Soft lock injection: when player is available and target not yet met, auto-lock them to their preferred position
- Bench equity unchanged: `planBench()` runs before soft lock injection, specialization does not affect who sits
- Result view shows specialization fulfillment (achieved/target) and excludes spec innings from unintentional repeat count
- Python API parity

**Non-Goals:**
- Multi-inning pitching (future)
- Guaranteeing target fulfillment (it's aspirational; bench and pitching take priority)
- Whole-game locks via specialization (that's what hard field locks are for)
- Specialization affecting bench planning (bench equity is sacrosanct at this age)

## Decisions

**D1: Specialization on `Player`, not on `LineupInput`**

Specializations are a property of the player across games, not specific to one game's inning structure. Placing them on `Player` (`specializations?: Specialization[]`) keeps them co-located with name/number in the roster step and makes the data model coherent. Alternative: a separate top-level `specializations` field on `LineupInput`. Rejected — would require duplicating player identity references and splits logically related data.

**D2: Soft lock injection as a pre-processing pass, not a modified `tryAssign`**

For each inning, before calling `tryAssign()`, compute which specialization soft locks apply (player available, target not yet met, position not already hard-locked). Merge these into `lockedThisInning`. This reuses the existing lock machinery entirely — no changes to the recursive assignment function. Alternative: modify `tryAssign()`'s sort to prefer specialization players. Rejected — the sort approach is a preference, not a guarantee, and produces unpredictable fulfillment counts; the injection approach is deterministic.

**D3: Priority when multiple specializations compete for the same position**

If Alice (1B, target 2, has 0) and Bob (1B, target 2, has 1) are both available and both specialized at 1B, Alice gets priority (more remaining innings needed). Tie-break: lower batting order index. This is evaluated per position per inning, not globally. Alternative: random selection. Rejected — coaches need predictable behavior.

**D4: Priority within a single player's multiple specializations**

If Alice has 1B (2 remaining) and CF (1 remaining), 1B gets priority. If tied, first listed wins. Only one specialization soft lock is injected per player per inning (they can only play one position). After the highest-priority eligible specialization is selected, the others wait for future innings.

**D5: Hard locks override specialization soft locks**

If a coach hard-locks Bob to 1B in inning 3, Alice's 1B soft lock for that inning is suppressed. Alice may get 1B in other innings. Her fulfillment counter reflects only actual assignments, not attempted soft locks. Alternative: error/warning on conflict. Rejected — the coach's explicit hard lock is intentional; silently deferring the soft lock is the right behavior.

**D6: Fulfillment tracking via post-processing, not mid-engine tracking**

After all innings are assigned, scan `fullHistory` per player per specialization position to count actual innings at that position. Compare to target. This is a pure read of existing data — no additional state needed during engine execution. The `repeats` counter subtracts specialization innings from its tally.

**D7: `planBench()` is unchanged**

Bench equity is determined before specialization soft locks are applied. A player with specializations sits bench on their normally scheduled innings, then gets their preferred position on playing innings. Specialization does not reduce bench duty. This was an explicit requirement.

**D8: Result additions — fulfillment summary and adjusted repeat counter**

`LineupResult` gains:
- `specializationResults: Array<{ player: string; position: string; target: number; achieved: number }>`
- `repeats` is adjusted to exclude fulfilled specialization innings (unintentional repeats only)

The UI renders a fulfillment summary below the result header. Shortfalls (achieved < target) are shown without blocking.

## Risks / Trade-offs

[Target impossible to fulfill] A player with bench duty + pitching duty may have fewer playing innings than their target. → Mitigation: show shortfall in results; coaches set targets knowing the roster situation.

[Two specialists collide every inning] If Alice and Bob are both specialized at 1B and both always available, Bob never gets 1B (Alice always wins on "most remaining"). → Mitigation: the priority rule is deterministic and transparent. Coach can adjust by hard-locking specific innings or accepting that one player's target won't fully fill.

[Specialization + bench consecutive sit interaction] If Alice is soft-locked to 1B but sits bench in inning 3, her 1B count doesn't increment. With the no-consecutive-bench improvement (not in this change), this would be further mitigated. → Noted as future improvement.

[Player interface change propagates] Adding `specializations` to `Player` affects everywhere `Player` is used. Since it's optional with a default of `[]`, it's backward compatible. → Low risk.

## Open Questions

None — all design decisions resolved during exploration.
