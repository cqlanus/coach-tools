## ADDED Requirements

### Requirement: Defense page displays up to 3 MLB clip links per scenario
When `defense-clips.json` contains entries for the currently selected scenario, the defense page SHALL display up to 3 clip links. Each link opens the corresponding Baseball Savant sporty-videos URL in a new browser tab. Links are labeled "▶ Example 1", "▶ Example 2", "▶ Example 3" (only as many as are available).

#### Scenario: Scenario has 3 clips
- **WHEN** the selected base state and play type combination has 3 entries in defense-clips.json
- **THEN** three clip links are shown, labeled Example 1, 2, and 3

#### Scenario: Scenario has 1 clip
- **WHEN** the selected scenario has 1 entry
- **THEN** one clip link is shown, labeled Example 1

#### Scenario: Scenario has no clips
- **WHEN** the selected scenario key is absent from defense-clips.json
- **THEN** no clip links are shown; only the Statcast search link is present

### Requirement: A Statcast search link is always present
Regardless of clip availability, the defense page SHALL always show a "Browse Statcast ↗" link that opens a Baseball Savant search URL pre-filtered for the current play type and base situation. This allows coaches to find additional examples manually.

#### Scenario: Always-present search link
- **WHEN** any scenario is selected
- **THEN** a "Browse Statcast ↗" link is visible and opens a Savant search URL in a new tab

#### Scenario: Search URL reflects current selection
- **WHEN** the coach switches to a different play type or base state
- **THEN** the Statcast search link URL updates to match the new selection

### Requirement: Clip links and search link open in a new tab
All external links to Baseball Savant SHALL use `target="_blank" rel="noopener"`. No iframe embedding is used (Baseball Savant blocks embedding via X-Frame-Options: DENY).

#### Scenario: New tab behavior
- **WHEN** a coach clicks any clip link or the Statcast search link
- **THEN** the link opens in a new browser tab, leaving the defense tool open

### Requirement: Outfield play type labels are renamed to "Outfield Single"
The `PLAY_TYPE_OPTIONS` array in `defense-situations.ts` SHALL use the group label "Outfield Single" (replacing "Outfield Ground Ball") and update individual labels to "Single to LF", "Single to CF", "Single to RF". The internal `value` keys (`gb_lf`, `gb_cf`, `gb_rf`) and all other references remain unchanged.

#### Scenario: Updated group label in play selector
- **WHEN** the coach opens the "Ball in play" selector
- **THEN** the optgroup heading reads "Outfield Single" and the options read "Single to LF", "Single to CF", "Single to RF"

#### Scenario: Internal keys unchanged
- **WHEN** the play type "Single to LF" is selected
- **THEN** the internal value `gb_lf` is used for situation lookup and clip lookup, unchanged from before

### Requirement: Clip section is visually compact and does not crowd the field diagram
The clip links and search link SHALL be rendered as a compact inline row below the field diagram area (or alongside the situation detail panel) without adding significant vertical height or pushing the diagram off screen on mobile.

#### Scenario: Compact layout
- **WHEN** clips are available for the current scenario
- **THEN** the clip links and search link fit in a single line or small block that does not cause layout shift on the field diagram
