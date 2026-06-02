## Context

The defense tool's 104 scenarios are keyed as `{base}:{play_type}` (e.g., `100:gb_ss`). The prior prototype (`baseball_defense/fetch_clips.py`) used a reversed format (`gb_ss_100`) and was a standalone project. This change adapts that pipeline for coach-tools with updated scenario keys, a split scoring heuristic, and a bundled JSON output instead of a JS file.

Baseball Savant blocks iframe embedding (X-Frame-Options: DENY). All clip links open in a new tab. This is intentional and requires no workaround.

## Goals / Non-Goals

**Goals:**
- Offline fetch script that runs in ~15-25 minutes and produces `defense-clips.json` with up to 3 clips per scenario
- Split scoring: infield prefers low xBA (routine plays); outfield/doubles prefer high xBA (solid contact)
- Drop `bb_type=ground_ball` filter for outfield play types — captures line drives and soft fly balls that become singles, not just grounders
- Up to 3 clip links shown per scenario; graceful degradation when none found
- Always-present Statcast search link for manual browsing
- Label rename: "Outfield Ground Ball" group → "Outfield Single"

**Non-Goals:**
- Real-time clip fetching (offline pipeline only)
- Iframe video embedding (blocked by Savant)
- Automatic re-fetching or scheduled updates
- Curation UI (JSON file is edited by hand if needed)

## Decisions

**D1: Scenario key format — `{base}:{play_type}`**

Matches the existing `SituationKey` type in `defense-situations.ts`. Example: `"100:gb_ss"`. The old script used `{play_type}_{base}` — updated in the new script.

**D2: JSON structure — array of up to 3 clips per key**

```json
{
  "000:gb_ss": [
    {
      "play_id": "064e8918-e2b7-40f0-ac39-968932652154",
      "video_url": "https://baseballsavant.mlb.com/sporty-videos?playId=064e8918-...",
      "game_date": "2024-07-15",
      "matchup": "NYY @ BOS"
    }
  ]
}
```

Scenarios with no candidates are omitted (key absent). The UI treats absent keys as "no clips available." Alternative considered: store an empty array for missing scenarios. Rejected — bloats the file and adds no value.

**D3: Split scoring heuristic**

| Scenario type | xBA preference | Launch angle | bb_type filter |
|---|---|---|---|
| Infield GB (p, c, 1b, 2b, ss, 3b) | low (< 0.15) → +2 | flat (-10° to 10°) → +1 | `ground_ball` |
| Outfield single (lf, cf, rf) | high (> 0.50) → +2 | none | none (remove filter) |
| Doubles (dbl_*) | high (> 0.50) → +2 | none | none |

Both types: 0 outs → +3, recent season (2024 > 2023) → +1.

Rationale: infield routine plays benefit from weak contact (everyone's role is clear, no chaos). Outfield plays need solid hits — a dribbler through the hole doesn't show the relay throw or cutoff rotation clearly.

**D4: Play ID lookup via MLB Stats API (unchanged from prototype)**

Savant CSV rows contain `game_pk` + `at_bat_number` but not the UUID `play_id` needed for the video URL. The MLB Stats API `GET /api/v1/game/{game_pk}/playByPlay` resolves this. Full game data is cached per `game_pk` to minimize API calls.

**D5: Bundled JSON — `apps/web/src/data/defense-clips.json`**

Committed to the repo and imported directly in the page component. No runtime network request needed. File size is ~30-80KB depending on coverage — well within acceptable bundle limits. Alternative: serve from `/public/` and fetch at runtime. Rejected — adds latency and complexity for a file that only changes when re-curated.

**D6: UI placement — below the field diagram, above the assignments list**

Clip links appear as a compact row: "▶ Example 1 · 2 · 3" plus a dimmer "Browse Statcast ↗" link. When no clips exist, only the Statcast search link is shown. The Statcast URL is constructed from `play_type + base_state` using the same URL-builder logic from the prototype.

**D7: Seasons — 2024 primary, 2023 fallback**

Fetch both seasons; score 2024 higher. Scenarios with no 2024 candidates fall back to 2023. The fetch script accepts a `SEASONS` list at the top for easy future updates.

## Risks / Trade-offs

[Savant rate limiting] The script makes many requests over 15-25 minutes. Polite rate limiting (1-2s between Savant fetches, 0.1s between Stats API calls) has worked in the prototype. → Mitigation: preserve the retry logic and exponential backoff from the prototype.

[Outfield xBA filter] High xBA preference for outfield plays may return multi-base hits or home runs that were misclassified as singles. The `event=single` filter on the Savant query prevents this at the database level. → Low risk.

[Missing coverage] Some rare scenarios (e.g., `001:gb_c` — runner on 3rd, catcher fields a grounder) may have very few qualifying plays in 2023-2024. The script records however many it finds (0-3); the UI degrades gracefully. → Acceptable.

[JSON staleness] The committed JSON reflects 2023-2024 seasons. Re-running the script in future seasons updates it. No automated mechanism — requires a manual re-run and commit. → Acceptable for this use case.

## Open Questions

None — all design decisions resolved during exploration.
