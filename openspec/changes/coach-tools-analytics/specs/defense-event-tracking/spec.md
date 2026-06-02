## ADDED Requirements

### Requirement: defense-scenario-viewed event fires on every selector change
When either `baseState` or `playType` changes in the defense page, a `defense-scenario-viewed` event SHALL be tracked with properties: `base` (the base state code, e.g. `"100"`) and `play` (the play type key, e.g. `"gb_ss"`).

#### Scenario: Event fires on base state change
- **WHEN** the coach selects a different base situation
- **THEN** `window.umami?.track('defense-scenario-viewed', { base: newBase, play: playType })` is called

#### Scenario: Event fires on play type change
- **WHEN** the coach selects a different ball in play
- **THEN** `window.umami?.track('defense-scenario-viewed', { base: baseState, play: newPlay })` is called

### Requirement: defense-clip-clicked event fires when an MLB example link is clicked
When the coach clicks one of the "▶ Example N" clip links, a `defense-clip-clicked` event SHALL be tracked with properties: `scenario` (the combined key, e.g. `"100:gb_ss"`) and `example` (the 1-based clip number).

#### Scenario: Clip click tracked with scenario and example number
- **WHEN** the coach clicks "▶ Example 2" for scenario `100:gb_ss`
- **THEN** `window.umami?.track('defense-clip-clicked', { scenario: '100:gb_ss', example: 2 })` is called

### Requirement: defense-search-clicked event fires when the Statcast search link is clicked
When the coach clicks the "Browse Statcast ↗" link, a `defense-search-clicked` event SHALL be tracked with property: `scenario` (the combined key for the current selection).

#### Scenario: Search link click tracked
- **WHEN** the coach clicks "Browse Statcast ↗" for scenario `000:dbl_ll`
- **THEN** `window.umami?.track('defense-search-clicked', { scenario: '000:dbl_ll' })` is called
