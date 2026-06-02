## Why

The defensive responsibilities tool has all 104 situations fully mapped but no video examples. Coaches learn best from seeing real plays — a link to an actual MLB game clip showing a shortstop ranging to his left with runners on base is worth more than any diagram. Baseball Savant's Statcast database contains video for every play since 2015; this change surfaces up to three curated clips per scenario directly in the tool.

## What Changes

- Add `scripts/fetch_defense_clips.py` — an offline pipeline that queries Baseball Savant CSV exports and the MLB Stats API to find, score, and output the top 3 clips per scenario as a bundled JSON file
- Scoring is split: infield scenarios prefer low xBA (routine, clean plays); outfield and double scenarios prefer high xBA (solid hits that clearly reach the outfield)
- Rename the "Outfield Ground Ball" play group to "Outfield Single" in `defense-situations.ts` (`PLAY_TYPE_OPTIONS` labels and group only — internal `value` keys unchanged)
- Add `apps/web/src/data/defense-clips.json` — committed static file, bundled into the Next.js build
- Update `apps/web/src/app/defense/page.tsx` to show up to 3 "▶ Example" clip links per scenario (new tab, no iframe) and a persistent "Browse Statcast ↗" search link

## Capabilities

### New Capabilities

- `defense-clip-fetch`: Offline Python script that fetches Statcast play candidates per scenario, scores them (split heuristic for infield vs. outfield), resolves play IDs via the MLB Stats API, and writes the final `defense-clips.json`
- `defense-clip-display`: In-app display of up to 3 curated MLB clip links per scenario alongside an always-present Statcast search fallback link

### Modified Capabilities

<!-- none — label rename is an implementation detail, not a spec-level behavior change -->

## Impact

- `scripts/fetch_defense_clips.py` — new offline script (Python, `requests` + `pandas`)
- `apps/web/src/data/defense-clips.json` — new static data file committed to repo
- `apps/web/src/lib/defense-situations.ts` — label/group rename for outfield play types
- `apps/web/src/app/defense/page.tsx` — clip link UI addition
- No changes to the Python FastAPI, lineup tool, or docx generation
