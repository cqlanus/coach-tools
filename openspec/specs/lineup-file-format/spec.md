## ADDED Requirements

### Requirement: File format supports markdown and org-mode variants
The lineup file format SHALL exist in two variants — markdown and org-mode — that differ only in metadata and section header syntax. Section content syntax SHALL be identical between variants.

#### Scenario: Markdown variant structure
- **WHEN** a file uses `##` section headings and key-value metadata lines
- **THEN** it is a valid markdown lineup file

#### Scenario: Org-mode variant structure
- **WHEN** a file uses `#+KEY: value` property lines and `*` section headings
- **THEN** it is a valid org-mode lineup file

### Requirement: Metadata fields encode game configuration
The file SHALL support the following metadata fields: team name, date (YYYY-MM-DD), innings (4, 5, or 6), and outfield format (`standard` or `4-outfielder`). All metadata fields are optional; absent fields leave the corresponding GUI field unchanged.

#### Scenario: Markdown metadata
- **WHEN** a markdown file contains `Date: 2026-06-07`, `Innings: 6`, `Outfield: standard` after the title
- **THEN** those values are parsed into the corresponding lineup input fields

#### Scenario: Org metadata
- **WHEN** an org file contains `#+DATE: 2026-06-07`, `#+INNINGS: 6`, `#+OUTFIELD: standard`
- **THEN** those values are parsed into the corresponding lineup input fields

### Requirement: Roster section encodes batting order with optional jersey number and specializations
The Roster section SHALL contain one player per line in batting order. Each line SHALL begin with an optional list number, followed by the player name, an optional `#number` jersey, and an optional `spec:` clause listing one or more `POSITION×N` specialization entries separated by commas.

#### Scenario: Full roster line
- **WHEN** a roster line reads `3. Carol #7  spec: 1B×2, CF×2`
- **THEN** Carol is placed third in batting order with jersey 7 and two specializations: 1B target 2, CF target 2

#### Scenario: Minimal roster line
- **WHEN** a roster line reads `Alice`
- **THEN** Alice is added to the roster with no jersey number and no specializations

#### Scenario: Roster order is preserved
- **WHEN** the roster section lists players top to bottom
- **THEN** batting order matches that top-to-bottom sequence regardless of list numbers present

### Requirement: Pitchers and Catchers sections encode per-inning assignments as comma-separated lists
The Pitchers and Catchers sections SHALL each contain a single comma-separated list of player names, one name per inning in order. Missing trailing entries leave those inning slots unassigned.

#### Scenario: Complete pitchers list for 6 innings
- **WHEN** the Pitchers section contains `Alice, Bob, Alice, Carol, Dave, Eve`
- **THEN** innings 1–6 are assigned those pitchers in order

#### Scenario: Partial pitchers list
- **WHEN** the Pitchers section contains `Alice, Bob` for a 6-inning game
- **THEN** innings 1–2 are assigned, innings 3–6 are left blank

### Requirement: Locks section encodes optional per-inning field position locks
The Locks section SHALL contain zero or more lines in the form `inning/POSITION: PlayerName`. Inning is a 1-based integer, POSITION is a valid field position for the active outfield format, and PlayerName must match a roster entry (case-insensitively).

#### Scenario: Single lock entry
- **WHEN** the Locks section contains `2/1B: Carol`
- **THEN** Carol is hard-locked to 1B in inning 2

#### Scenario: Multiple locks
- **WHEN** the Locks section contains `2/1B: Carol` and `3/SS: Dave`
- **THEN** both locks are applied to their respective innings

#### Scenario: Absent Locks section
- **WHEN** no Locks section is present
- **THEN** no field position locks are applied

### Requirement: Parser normalizes smart quotes and case before matching
Before any name matching or section parsing, the parser SHALL normalize smart quotes (`'`, `'`, `"`, `"`) to straight equivalents, em/en dashes to hyphens, and trim whitespace from all lines. Player name lookups SHALL be case-insensitive.

#### Scenario: Smart quote normalization
- **WHEN** macOS Notes produces `O'Brien` with a right single quote
- **THEN** the parser matches it to a roster entry named `O'Brien`

#### Scenario: Case-insensitive name matching
- **WHEN** the Pitchers section lists `alice` and the roster contains `Alice`
- **THEN** the pitcher assignment resolves to Alice
