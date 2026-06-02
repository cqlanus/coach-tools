## ADDED Requirements

### Requirement: Previous lineups section appears above the 3-step form
The lineup page SHALL display a "Previous lineups" section above the step indicator and roster/assignment/result cards. The section SHALL only be visible when at least one saved lineup exists in localStorage. It SHALL NOT appear on first visit or after all entries have been deleted.

#### Scenario: Section visible with history
- **WHEN** one or more lineups are saved in localStorage
- **THEN** the "Previous lineups" section is visible above the step form

#### Scenario: Section hidden with no history
- **WHEN** no lineups are saved in localStorage (first visit or all deleted)
- **THEN** no history section is rendered; the page goes directly to the step form

### Requirement: Each history entry displays team name and date with Load and delete controls
Each entry in the history list SHALL show the team name and formatted date (e.g., "Green Sox · Jun 7, 2026"). Each entry SHALL have a "Load" button and a delete (×) button.

#### Scenario: Entry display
- **WHEN** a saved lineup entry is rendered
- **THEN** the coach can read the team name and date, and sees both a Load and a × control

### Requirement: Loading a saved lineup restores form state and routes appropriately
Clicking "Load" on a history entry SHALL restore the saved `LineupInput` into form state using the same merge and routing logic used by `handleImport`. If the input is complete (roster present and all pitchers and catchers filled for the configured innings), the rotation SHALL be auto-generated and the tool SHALL jump to the result step. If partial, the tool SHALL navigate to the appropriate incomplete step.

#### Scenario: Complete lineup auto-generates
- **WHEN** the coach clicks "Load" on an entry with a complete roster and all P/C assignments
- **THEN** the rotation is generated automatically and the result step is shown

#### Scenario: Partial lineup navigates to appropriate step
- **WHEN** the coach clicks "Load" on an entry with a roster but missing pitcher/catcher assignments
- **THEN** form state is restored and the tool navigates to the assignments step

### Requirement: Deleting a history entry removes it immediately from the UI
Clicking × on a history entry SHALL call `deleteLineup(id)`, remove the entry from localStorage, and re-render the history list without the deleted entry. No confirmation dialog is required.

#### Scenario: Delete updates the list immediately
- **WHEN** the coach clicks × on a history entry
- **THEN** that entry disappears from the list immediately without a page reload

#### Scenario: Last entry deleted hides the section
- **WHEN** the coach deletes the only remaining history entry
- **THEN** the "Previous lineups" section disappears entirely

### Requirement: History section is populated after client-side mount
Because localStorage is not available during server-side rendering, the history section SHALL render with no entries on the initial server render and populate from localStorage in a `useEffect` after mount. This prevents Next.js hydration mismatches.

#### Scenario: No flash of history on SSR
- **WHEN** the page is first rendered on the server
- **THEN** the history section does not appear in the initial HTML (empty state)

#### Scenario: History populates after mount
- **WHEN** the component mounts in the browser
- **THEN** saved entries from localStorage appear in the history section
