## Why

Coaches repeatedly re-enter the same roster and assignment data through the GUI every game, even when they already know the full plan (pitcher per inning, catcher per inning, batting order). A plaintext import/export format lets coaches maintain a reusable game template file that round-trips with the tool — paste to generate, export to save, edit and repeat.

## What Changes

- Add a new `lineup-parser.ts` module that parses markdown and org-mode plaintext into lineup input state, and exports current state back to the same formats
- Add a collapsible "Import" textarea at the top of Step 1 (roster) that accepts pasted text and auto-routes to the correct step based on what's present in the file
- When a pasted file contains a complete game plan (roster + all pitchers + all catchers), auto-generate the rotation and jump directly to Step 3 (result)
- Add "Export" buttons in Step 2 (positions) and Step 3 (result) that emit the current state as a copyable plaintext file in the coach's chosen format (markdown or org)
- Parser handles both markdown (`##` headings, key-value metadata) and org-mode (`#+KEY:` properties, `*` headings), auto-detected from content
- Parser is resilient to macOS Notes artifacts: case-insensitive player name matching, smart quote normalization

## Capabilities

### New Capabilities

- `lineup-file-format`: The plaintext file format spec — sections, syntax, encoding of roster, per-inning assignments, field locks, and specializations in both markdown and org variants
- `lineup-import`: Paste-based import flow on Step 1 that parses, pre-fills state, and routes to the appropriate step or auto-generates
- `lineup-export`: Export buttons on Steps 2 and 3 that emit the current lineup state as a copyable plaintext file

### Modified Capabilities

<!-- none — no existing spec-level behavior changes -->

## Impact

- `apps/web/src/lib/lineup-parser.ts` — new module (parse + export)
- `apps/web/src/app/lineup/page.tsx` — import UI on Step 1, export buttons on Steps 2 and 3
- No changes to `lineup-engine.ts`, Python API, or `.docx` generation
