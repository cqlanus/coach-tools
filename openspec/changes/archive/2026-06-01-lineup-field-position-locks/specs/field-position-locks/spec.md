## ADDED Requirements

### Requirement: Coach can lock a field position to a player for a specific inning
The system SHALL allow coaches to optionally assign any field position (excluding pitcher and catcher) to a specific player for any individual inning. Locking is per-inning and independent across innings. The set of lockable positions SHALL reflect the active outfield format (standard: 1B/2B/3B/SS/LF/CF/RF; 4-outfielder: 1B/2B/3B/SS/LF/LC/RC/RF).

#### Scenario: Coach locks 1B for inning 2
- **WHEN** the coach selects "1B" and a player in the inning 2 lock section
- **THEN** that player is assigned to 1B in inning 2 and is not available for other positions or bench that inning

#### Scenario: Coach leaves all field locks empty
- **WHEN** the coach does not add any field position locks
- **THEN** the engine assigns all field positions automatically, unchanged from current behavior

#### Scenario: Lockable positions reflect outfield format
- **WHEN** 4-outfielder format is active
- **THEN** the position lock dropdown offers LC and RC instead of CF

### Requirement: Locked field positions are excluded from auto-assignment
The engine SHALL exclude locked positions from the auto-assignment pool and exclude locked players from the available player pool for that inning, then merge locked assignments into the final result.

#### Scenario: Locked player does not appear at another position
- **WHEN** Alice is locked to 1B in inning 1
- **THEN** Alice is not assigned to any other field position, bench, or available as pitcher or catcher in inning 1

#### Scenario: Locked position is not reassigned
- **WHEN** 1B is locked to Alice in inning 3
- **THEN** the auto-assignment algorithm does not assign any other player to 1B in inning 3

### Requirement: Locked players are excluded from bench planning
The bench planning algorithm SHALL treat players locked to field positions the same as pitchers and catchers—they are playing that inning and SHALL NOT be placed on the bench for that same inning. Their committed innings SHALL count toward duty totals for equitable bench distribution.

#### Scenario: Locked player not benched same inning
- **WHEN** Bob is locked to SS in inning 4
- **THEN** Bob does not appear in the bench list for inning 4

#### Scenario: Duty count reflects field locks
- **WHEN** Carol is locked to 1B in innings 1 and 3
- **THEN** Carol's duty count is incremented by 2 when computing bench equity

### Requirement: Field lock conflicts are detected and reported
The system SHALL detect and surface conflicts caused by field position locks.

#### Scenario: Locked player is also the pitcher that inning
- **WHEN** Dave is selected as pitcher for inning 2 and also locked to 1B for inning 2
- **THEN** a conflict error is shown and the rotation cannot be generated until resolved

#### Scenario: Locked player is also the catcher that inning
- **WHEN** Eve is selected as catcher for inning 5 and also locked to SS for inning 5
- **THEN** a conflict error is shown and the rotation cannot be generated until resolved

#### Scenario: Same player locked to two positions same inning
- **WHEN** Frank is locked to both 1B and 3B in inning 1
- **THEN** a conflict error is shown (UI prevents this via dropdown filtering; engine also validates)

### Requirement: Field lock UI presents inline position and player dropdowns
The assignment step SHALL render field locks as inline rows below the pitcher/catcher selectors for each inning. Each row contains a position dropdown, a player dropdown, and a remove button. An add button creates a new blank row.

#### Scenario: Adding a lock row
- **WHEN** the coach clicks "+ Lock a position" for an inning
- **THEN** a new inline row appears with a position dropdown and a player dropdown

#### Scenario: Position dropdown excludes already-locked positions
- **WHEN** 1B is already locked in inning 1
- **THEN** 1B does not appear in the position dropdown for any additional lock row in inning 1

#### Scenario: Player dropdown excludes unavailable players
- **WHEN** Alice is the pitcher and Bob is locked to SS in inning 2
- **THEN** Alice and Bob do not appear in the player dropdown for any additional lock row in inning 2

#### Scenario: Removing a lock row
- **WHEN** the coach clicks × on a lock row
- **THEN** that position and player are freed and the row is removed

### Requirement: Field locks are optional and do not block generation
Field position locks SHALL be optional for all innings. The generate button SHALL remain enabled (subject only to pitcher/catcher assignment requirements) when no field locks are set.

#### Scenario: Generate with no field locks
- **WHEN** no field position locks are set for any inning
- **THEN** the Generate Rotation button is enabled (assuming pitchers and catchers are assigned) and produces a valid rotation
