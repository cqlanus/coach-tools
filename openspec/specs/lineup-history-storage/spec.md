## ADDED Requirements

### Requirement: Generated lineups are auto-saved to localStorage after each generation
The system SHALL automatically save a lineup to localStorage every time `generate()` succeeds. The save SHALL occur immediately after the result is computed, before navigating to the result step. No user action is required to trigger the save.

#### Scenario: Lineup saved on generate
- **WHEN** the coach clicks "Generate Rotation" and the engine returns a valid result
- **THEN** a `SavedLineup` entry is written to localStorage under the key `lineup_history`

#### Scenario: Failed generation is not saved
- **WHEN** `generateLineup()` returns conflict errors or an empty assignments array
- **THEN** no entry is written to localStorage for that attempt

### Requirement: Each saved entry stores both input and result
Each `SavedLineup` entry SHALL contain: a unique `id` (string), a `savedAt` ISO timestamp, the full `LineupInput` used to generate the rotation, and the full `LineupResult` produced.

#### Scenario: Entry structure
- **WHEN** a lineup is saved
- **THEN** the stored object contains `id`, `savedAt`, `input` (full LineupInput), and `result` (full LineupResult) fields

### Requirement: Saving overwrites when team name and date match
If an existing entry in localStorage has the same team name (case-insensitive, trimmed) and the same date as the new lineup, the existing entry SHALL be replaced with the new one. Otherwise the new entry is prepended to the list.

#### Scenario: Overwrite on same team + date
- **WHEN** a lineup is generated with team "Green Sox" and date "2026-06-07", and an entry already exists with the same team and date
- **THEN** the existing entry is replaced; the total count of history entries does not increase

#### Scenario: Append on different date
- **WHEN** a lineup is generated with a date different from all existing entries' dates (for the same team)
- **THEN** the new entry is prepended; the total count increases by one

### Requirement: History entries can be deleted individually
The system SHALL provide a `deleteLineup(id)` function that removes the entry with the matching `id` from localStorage. If no entry with that `id` exists, the call is a no-op.

#### Scenario: Delete removes entry
- **WHEN** `deleteLineup` is called with a valid `id`
- **THEN** that entry is removed from `lineup_history` in localStorage and the updated list no longer contains it

### Requirement: History list is sorted newest-first
The `lineup_history` array in localStorage SHALL be maintained in descending `savedAt` order. Newly saved entries appear at the front of the list.

#### Scenario: New entry appears first
- **WHEN** a new lineup is saved
- **THEN** it appears as the first item when the history list is loaded

### Requirement: History is stored in a single localStorage key
All saved lineups SHALL be stored as a JSON array under the key `"lineup_history"`. Malformed or missing data under that key SHALL be treated as an empty array without throwing.

#### Scenario: Missing key treated as empty
- **WHEN** `lineup_history` does not exist in localStorage
- **THEN** the history list is treated as empty and no error is thrown

#### Scenario: Corrupted data treated as empty
- **WHEN** `lineup_history` contains invalid JSON
- **THEN** the history list is treated as empty and no error is thrown
