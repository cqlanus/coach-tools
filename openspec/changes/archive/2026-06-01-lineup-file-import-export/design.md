## Context

The lineup generator is a 3-step GUI (Roster → Positions → Result). All state lives in React component state in `page.tsx`. The engine (`lineup-engine.ts`) is a pure function that takes a `LineupInput` and returns a `LineupResult`. The goal is to let coaches paste a plaintext file that pre-fills that component state and optionally skips straight to generating.

The file format must work in two real authoring environments: macOS Notes (which may add smart quotes and auto-capitalize) and Emacs org-mode (which has `#+KEY:` property syntax and `*` section headings). Markdown text editors are also explicitly supported.

## Goals / Non-Goals

**Goals:**
- Parse pasted plaintext (markdown or org) into the same React state shape the GUI produces
- Auto-detect format from content signatures
- Route to the first incomplete step, or auto-generate when the file is complete
- Export current state back to the same formats for round-trip editing
- Resilient parsing: case-insensitive names, smart quote normalization, flexible whitespace
- No new dependencies — pure string parsing in TypeScript

**Non-Goals:**
- File upload (paste only)
- Persisting files between sessions (no localStorage)
- Validating the file against the engine — parse errors shown inline, engine validation unchanged
- Python API changes (import/export is UI-only)
- YAML/TOML/JSON support (markdown and org only)

## Decisions

**D1: New module `lineup-parser.ts` — parse and export co-located**

Both parse and export logic live in one new file, separate from `lineup-engine.ts`. This keeps the engine pure and the parser independently testable. The parser outputs a `ParsedLineup` type that maps directly to the page's React state fields; the page applies it without transformation.

**D2: Auto-detection by content signature**

If the text contains one or more lines matching `/^\#\+[A-Z]+:/` → org-mode. Otherwise → markdown. This is a first-line heuristic; fallback is markdown. No explicit format selector needed in the UI.

**D3: Identical section content syntax for both formats**

Section headers differ (`## Roster` vs `* Roster`) but section content is parsed identically:
- Roster: numbered or unnumbered list lines, `name #number  spec: POS×N, POS×N`
- Pitchers/Catchers: comma-separated names in order (one name per inning, left to right)
- Locks: `inning/POSITION: PlayerName` lines (e.g. `2/1B: Alice`)

This means the parser is: detect format → normalize section headers → parse section content with shared logic.

**D4: `ParsedLineup` return type — partial is valid**

```typescript
interface ParsedLineup {
  teamName?: string;
  gameDate?: string;
  innings?: number;
  outfieldFormat?: OutfieldFormat;
  roster?: Player[];          // includes specializations
  pitchers?: string[];        // sparse — missing entries are ""
  catchers?: string[];        // sparse — missing entries are ""
  lockedFieldPositions?: Array<Record<string, string>>;
}
```

The page merges this into existing state: present fields overwrite, absent fields are left unchanged. This means a partial file never blanks out existing GUI entries.

**D5: Routing logic after parse**

```
has roster (≥1 player) AND all pitchers filled AND all catchers filled
  → call generateLineup() directly → setStep("result")

has roster AND some P/C missing
  → apply state → setStep("assignments")

roster missing or empty
  → apply whatever metadata is present → remain on "setup" (step 1)
```

"All pitchers/catchers filled" means the parsed arrays have non-empty strings for every inning index 0…(innings-1).

**D6: Export format selection — two buttons, not a toggle**

Step 2 and Step 3 each show two small export buttons: "Copy as Markdown" and "Copy as Org". Clicking copies to clipboard. No download, no modal — coach pastes wherever they like. Alternative considered: a single button with a dropdown. Rejected — two buttons is faster and avoids an extra click.

**D7: Smart quote and encoding normalization in parser**

Before section parsing, the raw input is normalized:
- `'` / `'` → `'`
- `"` / `"` → `"`
- `–` / `—` → `-`
- Trim all lines

Player name lookups during export (e.g. finding a player to write their specialization) use the normalized name. Parse-time name matching is case-insensitive for pitcher/catcher/lock name resolution against the roster.

**D8: Import textarea placement — collapsible at top of Step 1**

A "↓ Import lineup file" disclosure button at the top of the Step 1 card expands to a textarea. Pasting triggers parse-on-change (debounced or on blur). A "Load" button applies the result. This keeps the normal GUI flow uncluttered for coaches who aren't using import.

## Risks / Trade-offs

[macOS Notes smart formatting] Notes may reformat list numbers, add bullets, or change quote styles mid-paste. → Mitigation: normalization pass before parsing; test against common Notes output patterns.

[Partial pitcher/catcher arrays] If a file specifies 4 pitchers for a 6-inning game, innings 5 and 6 are blank. The page lands on step 2 with those slots empty — expected and correct. → No mitigation needed; this is the intended partial-fill behavior.

[Clipboard API availability] `navigator.clipboard.writeText` requires a secure context (HTTPS or localhost). Deployed over HTTPS, this is fine. → Low risk given deployment context.

[Name collisions in locks/P/C] If two roster players have the same name, the parser takes the first match. → The engine already has this limitation; no special handling needed.

## Open Questions

None — all design decisions resolved during exploration.
