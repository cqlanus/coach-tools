## ADDED Requirements

### Requirement: Export is available in Step 2 and Step 3
The tool SHALL provide export functionality at two points in the flow: Step 2 (Positions, after assignments are entered) and Step 3 (Result, after generation). Each location SHALL offer two copy buttons: "Copy as Markdown" and "Copy as Org".

#### Scenario: Export buttons visible in Step 2
- **WHEN** the coach is on Step 2 with at least a roster entered
- **THEN** "Copy as Markdown" and "Copy as Org" buttons are visible

#### Scenario: Export buttons visible in Step 3
- **WHEN** the coach is on Step 3 viewing a generated result
- **THEN** "Copy as Markdown" and "Copy as Org" buttons are visible

### Requirement: Export copies plaintext to clipboard
Clicking an export button SHALL copy the formatted lineup file to the system clipboard using the Clipboard API. No file download or modal is shown. A brief confirmation ("Copied!") SHALL appear inline after a successful copy.

#### Scenario: Successful copy
- **WHEN** the coach clicks "Copy as Markdown"
- **THEN** the markdown-formatted lineup file is in the clipboard and "Copied!" appears briefly

#### Scenario: Clipboard unavailable
- **WHEN** the Clipboard API is unavailable (insecure context)
- **THEN** a fallback textarea containing the export text is shown for manual copying

### Requirement: Exported file encodes all current state
The exported file SHALL include all state present at the time of export: metadata (team, date, innings, outfield), roster (with jersey numbers and specializations), pitcher and catcher assignments for all innings (blank entries represented as empty strings in the list), field position locks (if any), and the outfield format.

#### Scenario: Full state export from Step 3
- **WHEN** the coach exports from Step 3 after generating a rotation
- **THEN** the file includes roster, all pitcher/catcher assignments, and any locks

#### Scenario: Partial state export from Step 2
- **WHEN** the coach exports from Step 2 before all innings are assigned
- **THEN** the file includes the roster and whatever P/C assignments have been entered; blank innings are included as empty entries in the comma list

### Requirement: Exported file is valid for re-import
An exported file SHALL parse successfully back into the tool and reproduce the same state it was exported from (round-trip fidelity). Player names, jersey numbers, specializations, and per-inning assignments SHALL survive the round-trip unchanged.

#### Scenario: Round-trip fidelity
- **WHEN** the coach exports a complete lineup file and re-imports it
- **THEN** the resulting state is identical to the state at export time, and auto-generation produces the same result

### Requirement: Exported org format uses org-mode syntax
When exporting as org, the file SHALL use `#+KEY: value` property lines for metadata and `*` headings for sections. Content within sections SHALL use the same syntax as the markdown variant.

#### Scenario: Org metadata
- **WHEN** the coach clicks "Copy as Org"
- **THEN** the clipboard contains `#+TITLE:`, `#+DATE:`, `#+INNINGS:`, `#+OUTFIELD:` property lines

#### Scenario: Org section headings
- **WHEN** the exported org file is opened in Emacs
- **THEN** sections appear as first-level org headings (`* Roster`, `* Pitchers`, etc.)
