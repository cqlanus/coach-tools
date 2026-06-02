## ADDED Requirements

### Requirement: Script fetches Statcast play candidates for all 104 defense scenarios
The script SHALL query Baseball Savant's CSV export endpoint for each event type and season combination, then filter results locally by hit location, batted ball type, and runner configuration to match each scenario. It SHALL cover all 104 scenarios: 48 infield ground ball scenarios (6 positions × 8 base states), 24 outfield single scenarios (3 positions × 8 base states), and 32 double scenarios (4 directions × 8 base states).

#### Scenario: Successful broad fetch
- **WHEN** the script runs and Savant returns data for a given event type and season
- **THEN** the script parses the CSV and stores it in an in-memory cache keyed by (event_type, season)

#### Scenario: Empty response handled gracefully
- **WHEN** Savant returns no rows or an error for a fetch chunk
- **THEN** the script logs a warning and continues without crashing

### Requirement: Play IDs are resolved via the MLB Stats API
Savant CSV rows contain `game_pk` and `at_bat_number` but not the UUID `play_id` required for video URLs. The script SHALL resolve play IDs by calling `GET https://statsapi.mlb.com/api/v1/game/{game_pk}/playByPlay` and SHALL cache results per `game_pk` to avoid redundant API calls.

#### Scenario: Play ID resolved successfully
- **WHEN** a valid `game_pk` and `at_bat_number` are present in a Savant row
- **THEN** the script retrieves the corresponding play UUID and constructs the video URL as `https://baseballsavant.mlb.com/sporty-videos?playId={uuid}`

#### Scenario: Play ID not found
- **WHEN** the Stats API returns no matching play for a game_pk/at_bat_number pair
- **THEN** that candidate is skipped silently

### Requirement: Scoring is split between infield and outfield scenario types
The script SHALL apply different scoring heuristics depending on whether the scenario is an infield ground ball, outfield single, or double.

#### Scenario: Infield ground ball scoring
- **WHEN** scoring a candidate for an infield ground ball scenario (gb_p, gb_c, gb_1b, gb_2b, gb_ss, gb_3b)
- **THEN** the score rewards 0 outs (+3), recent season (+1 for 2024), low xBA < 0.15 (+2, routine play), and flat launch angle -10° to 10° (+1)

#### Scenario: Outfield single scoring
- **WHEN** scoring a candidate for an outfield single scenario (gb_lf, gb_cf, gb_rf)
- **THEN** the score rewards 0 outs (+3), recent season (+1 for 2024), and high xBA > 0.50 (+2, solid contact); launch angle and batted ball type are not scored

#### Scenario: Double scoring
- **WHEN** scoring a candidate for a double scenario (dbl_ll, dbl_rl, dbl_lg, dbl_rg)
- **THEN** the score rewards 0 outs (+3), recent season (+1 for 2024), and high xBA > 0.50 (+2); launch angle and batted ball type are not scored

### Requirement: Outfield single scenarios do not filter by batted ball type
For outfield single scenarios, the script SHALL NOT apply a `bb_type=ground_ball` filter. Line drives and fly balls that result in singles are equally valid teaching examples and SHALL be included.

#### Scenario: Outfield scenario includes non-groundball singles
- **WHEN** filtering candidates for an outfield single scenario
- **THEN** all batted ball types (ground ball, line drive, fly ball, popup) are considered

### Requirement: Output is a JSON file with up to 3 clips per scenario
The script SHALL write `apps/web/src/data/defense-clips.json` containing a JSON object keyed by scenario ID in `{base}:{play_type}` format (e.g., `"100:gb_ss"`). Each value is an array of up to 3 clip objects. Scenarios with no candidates found SHALL be omitted from the output entirely.

#### Scenario: Scenario with 3 candidates
- **WHEN** a scenario has 3 or more scored candidates with resolved play IDs
- **THEN** the output contains an array of exactly 3 clip objects for that key

#### Scenario: Scenario with fewer than 3 candidates
- **WHEN** a scenario has 1 or 2 scored candidates
- **THEN** the output contains an array of that many clip objects

#### Scenario: Scenario with no candidates
- **WHEN** no qualifying plays are found for a scenario after filtering
- **THEN** the scenario key is absent from the output JSON

### Requirement: Each clip object contains play ID, video URL, game date, and matchup
Each entry in a scenario's clip array SHALL contain: `play_id` (UUID string), `video_url` (full Savant sporty-videos URL), `game_date` (YYYY-MM-DD string), and `matchup` (away team @ home team string).

#### Scenario: Clip object structure
- **WHEN** the script writes a clip entry
- **THEN** it contains `play_id`, `video_url`, `game_date`, and `matchup` fields with non-empty string values

### Requirement: Script applies polite rate limiting
The script SHALL pause between requests to avoid overloading Baseball Savant and the MLB Stats API. Savant CSV fetches SHALL pause at least 1.5 seconds between chunks; Stats API calls SHALL pause at least 0.1 seconds between games.

#### Scenario: Rate limiting between Savant fetches
- **WHEN** fetching consecutive date-range chunks from Savant
- **THEN** the script sleeps at least 1.5 seconds between each chunk request
