## ADDED Requirements

### Requirement: Import textarea is available at the top of Step 1
Step 1 (Roster) SHALL include a collapsible import section at the top of the card. Activating it reveals a textarea for pasting plaintext. A "Load" button triggers parsing and state application. The import section is collapsed by default and does not interfere with the normal GUI flow.

#### Scenario: Import section is collapsed by default
- **WHEN** the coach navigates to Step 1 normally
- **THEN** the import textarea is not visible; only a disclosure button is shown

#### Scenario: Expanding the import section
- **WHEN** the coach clicks the import disclosure button
- **THEN** the textarea becomes visible and ready to accept pasted text

#### Scenario: Loading pasted content
- **WHEN** the coach pastes text and clicks "Load"
- **THEN** the parsed state is applied and routing occurs

### Requirement: Format is auto-detected from pasted content
The parser SHALL detect org-mode format when the pasted text contains one or more lines matching `#+KEY:` (e.g. `#+TITLE:`, `#+INNINGS:`). All other content is treated as markdown. No explicit format selector is required.

#### Scenario: Org-mode detection
- **WHEN** pasted text contains `#+TITLE: Green Sox`
- **THEN** the parser uses org-mode section headers (`*`) to locate sections

#### Scenario: Markdown detection
- **WHEN** pasted text contains no `#+KEY:` lines
- **THEN** the parser uses markdown section headers (`##`) to locate sections

### Requirement: Parsed state is merged into existing GUI state
The parser output SHALL be merged into the current React component state. Fields present in the parsed result overwrite their corresponding state fields. Fields absent from the parsed result leave existing state unchanged.

#### Scenario: Roster overwrites existing roster
- **WHEN** the coach already has 3 players entered and loads a file with 9 players
- **THEN** the roster becomes the 9 parsed players

#### Scenario: Missing sections leave state intact
- **WHEN** the pasted file contains only a roster (no pitchers/catchers)
- **THEN** any previously entered pitcher/catcher assignments are preserved

### Requirement: Routing after import depends on completeness of parsed data
After applying parsed state, the tool SHALL route to the first incomplete step. If the file is fully complete (roster present and all pitchers and catchers filled for the configured innings count), the rotation SHALL be auto-generated and the tool SHALL jump directly to Step 3 (Result).

#### Scenario: Roster only → stay on Step 1
- **WHEN** the parsed file contains only a roster
- **THEN** the roster is pre-filled and the tool remains on Step 1

#### Scenario: Roster + all P/C → auto-generate → Step 3
- **WHEN** the parsed file contains a complete roster and all pitcher and catcher assignments for the configured innings count
- **THEN** `generateLineup()` is called automatically and the result is displayed on Step 3

#### Scenario: Roster + partial P/C → Step 2
- **WHEN** the parsed file has a roster but only some innings have pitchers or catchers assigned
- **THEN** the tool navigates to Step 2 with roster pre-filled and partial P/C assignments visible

### Requirement: Parse errors are shown inline without blocking
If the pasted text cannot be parsed (unrecognized format, malformed entries), the tool SHALL display a brief inline error message below the textarea. The existing GUI state SHALL remain unchanged. The coach can correct the text and re-load.

#### Scenario: Unrecognized content
- **WHEN** the coach pastes text with no recognizable sections
- **THEN** an error message appears: "Could not parse lineup file — check the format."

#### Scenario: Partial parse success
- **WHEN** the file has a valid roster but an unrecognized Pitchers line
- **THEN** the roster is applied and an inline warning notes the Pitchers section was skipped
