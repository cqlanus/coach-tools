## ADDED Requirements

### Requirement: Coach can assign specialization preferences to a player
The system SHALL allow coaches to assign one or more specialization entries to any player at the roster level. Each specialization entry consists of a field position and a target innings count (2, 3, or 4). Multiple specializations per player are permitted (e.g., 1B with target 2 and CF with target 2). Specialization entries are optional on all players.

#### Scenario: Coach adds a single specialization
- **WHEN** the coach adds a specialization entry of "1B, target 2" to Alice on the roster
- **THEN** Alice's player record includes that specialization and it is used during rotation generation

#### Scenario: Coach adds multiple specializations to one player
- **WHEN** the coach adds "1B, target 2" and "CF, target 2" to Alice
- **THEN** Alice has two active specializations and the engine attempts to fulfill both

#### Scenario: Player with no specialization behaves as before
- **WHEN** a player has no specialization entries
- **THEN** that player is assigned positions by the standard variety optimizer, unchanged

#### Scenario: Available target counts are 2, 3, and 4
- **WHEN** the coach opens the target innings selector for a specialization
- **THEN** the options offered are 2, 3, and 4

### Requirement: Engine injects specialization soft locks per inning
For each inning, before running auto-assignment, the engine SHALL inject a soft lock for each player whose specialization target is not yet met, provided the player is available (not pitching, not catching, not benched that inning) and the preferred position is not already hard-locked by another player. Only one specialization soft lock per player per inning is injected.

#### Scenario: Available specialized player gets soft lock
- **WHEN** Alice is specialized at 1B (target 2, achieved 0) and is not pitching, catching, or benched in inning 1
- **THEN** Alice is soft-locked to 1B for inning 1 before auto-assignment runs

#### Scenario: Benched player's specialization is skipped
- **WHEN** Alice is specialized at 1B but is scheduled to bench in inning 3
- **THEN** no soft lock is injected for Alice in inning 3 and her achieved count does not increment

#### Scenario: Pitching player's specialization is skipped
- **WHEN** Alice is specialized at 1B but is pitching in inning 2
- **THEN** no soft lock is injected for Alice in inning 2

#### Scenario: Soft lock stops after target is met
- **WHEN** Alice is specialized at 1B with target 2 and has already achieved 2 innings at 1B
- **THEN** no further soft lock is injected for Alice at 1B in remaining innings

### Requirement: Hard field locks override specialization soft locks
When a coach has hard-locked a position to another player, the specialization soft lock for that position SHALL be suppressed for that inning. The specialized player is placed by the variety optimizer instead. This inning does not count toward the specialization target.

#### Scenario: Hard lock suppresses soft lock for same position
- **WHEN** Bob is hard-locked to 1B in inning 2 and Alice is specialized at 1B
- **THEN** Alice does not receive a soft lock for 1B in inning 2 and may be assigned elsewhere

#### Scenario: Suppressed soft lock does not count toward target
- **WHEN** Alice's 1B soft lock is suppressed in inning 2 due to a hard lock
- **THEN** Alice's 1B achieved count remains unchanged for inning 2

### Requirement: Bench equity is unaffected by specialization
Specialization preferences SHALL NOT influence bench planning. Bench slots are distributed using duty-count equity before specialization soft locks are computed. A player with specializations sits bench on their normally-assigned innings the same as any other player.

#### Scenario: Specialized player still sits bench
- **WHEN** Alice is specialized at 1B and is due for bench in inning 4 by equity rules
- **THEN** Alice sits bench in inning 4 regardless of her specialization target

### Requirement: Priority ordering when multiple players specialize at the same position
When more than one player is specialized at the same position and both are available in the same inning, the player with the most remaining innings needed (target minus achieved) SHALL receive the soft lock. Ties are broken by batting order (earlier position wins).

#### Scenario: Player with more remaining innings gets priority
- **WHEN** Alice (1B, target 2, achieved 0 → 2 remaining) and Bob (1B, target 2, achieved 1 → 1 remaining) are both available in inning 1
- **THEN** Alice receives the 1B soft lock for inning 1

#### Scenario: Batting order breaks a tie
- **WHEN** Alice (1B, target 2, achieved 0) and Bob (1B, target 2, achieved 0) are tied and Alice bats before Bob
- **THEN** Alice receives the 1B soft lock

### Requirement: Priority ordering when a player has multiple specializations
When a player has multiple specializations and is available in an inning, the specialization with the most remaining innings needed SHALL be selected for soft lock injection. Ties are broken by the order the specializations were entered. Only one soft lock per player per inning is injected.

#### Scenario: Specialization with more remaining innings is chosen
- **WHEN** Alice has 1B (target 2, achieved 1 → 1 remaining) and CF (target 2, achieved 0 → 2 remaining) and is available
- **THEN** Alice receives a soft lock for CF, not 1B

#### Scenario: First-listed specialization wins a tie
- **WHEN** Alice has 1B (target 2, achieved 0) and CF (target 2, achieved 0), with 1B listed first
- **THEN** Alice receives a soft lock for 1B

### Requirement: Result view shows specialization fulfillment
After rotation generation, the system SHALL display a fulfillment summary for each active specialization: player name, position, target, and achieved count. Shortfalls (achieved < target) SHALL be shown without blocking generation. The unintentional repeats counter SHALL exclude innings assigned via specialization soft locks.

#### Scenario: Fulfilled specialization displayed
- **WHEN** Alice achieved 2 innings at 1B with a target of 2
- **THEN** the result shows "Alice — 1B: 2/2 ✓"

#### Scenario: Shortfall displayed without error
- **WHEN** Alice achieved 1 inning at 1B with a target of 2 (due to bench/pitching constraints)
- **THEN** the result shows "Alice — 1B: 1/2" without blocking rotation display

#### Scenario: Specialization innings excluded from repeat counter
- **WHEN** Alice plays 1B in innings 1 and 2 via specialization soft locks
- **THEN** those two innings are not counted as unintentional repeats in the repeats counter

### Requirement: Roster UI supports per-player specialization editing
The roster step SHALL allow coaches to add, edit, and remove specialization entries per player inline. Each entry row shows a position dropdown (field positions for the active outfield format) and a target innings selector (2, 3, 4). An add button appends a new blank entry row; a remove button deletes the row.

#### Scenario: Adding a specialization entry
- **WHEN** the coach clicks "+ Add specialization" on Alice's roster row
- **THEN** a new inline row appears with a position dropdown and a target selector

#### Scenario: Removing a specialization entry
- **WHEN** the coach clicks × on a specialization row
- **THEN** that entry is removed and will not influence rotation generation

#### Scenario: No specializations is valid
- **WHEN** a player has zero specialization entries
- **THEN** the roster step and rotation generation proceed normally with no impact
