## 1. Parser Module — Types and Normalization

- [x] 1.1 Create `apps/web/src/lib/lineup-parser.ts` with `ParsedLineup` interface (all fields optional, mirroring page state shape)
- [x] 1.2 Implement `normalizeText(raw: string): string` — replace smart quotes, em/en dashes, trim lines
- [x] 1.3 Implement `detectFormat(text: string): "markdown" | "org"` — check for `#+KEY:` lines
- [x] 1.4 Implement `extractSections(text: string, format: "markdown" | "org"): Record<string, string>` — split text into named sections by `##` or `*` headings, return map of section name (lowercase) → section body

## 2. Parser Module — Metadata and Roster Parsing

- [x] 2.1 Implement metadata extraction: parse team name (title line or `#+TITLE:`), date, innings, outfield format from the preamble before the first section heading
- [x] 2.2 Implement `parseRoster(section: string): Player[]` — parse one player per line: optional list number, name, optional `#number`, optional `spec: POS×N, POS×N`; preserve order
- [x] 2.3 Implement specialization clause parser: `spec: 1B×2, CF×2` → `Specialization[]` (handle `×` and `x` and `X` as multiplier)

## 3. Parser Module — Assignment and Lock Parsing

- [x] 3.1 Implement `parseCommaSeparatedNames(section: string): string[]` — split on commas, trim each entry, return ordered list (empty string for blank entries)
- [x] 3.2 Implement `parseLocks(section: string): Array<Record<string, string>>` — parse `inning/POSITION: PlayerName` lines into per-inning lock maps (1-indexed inning → 0-indexed array)
- [x] 3.3 Implement `resolveNames(names: string[], roster: Player[]): string[]` — case-insensitive match each name against roster, return canonical casing; unmatched names kept as-is

## 4. Parser Module — Top-Level Parse Function

- [x] 4.1 Implement `parseLineupFile(raw: string): { result: ParsedLineup; warnings: string[] }` — orchestrate normalize → detect → extract sections → parse each section → return result + any warnings
- [x] 4.2 Handle missing/empty sections gracefully: absent Pitchers section → `pitchers` field absent from result (not empty array)
- [x] 4.3 Return at least one warning when no recognizable sections are found

## 5. Exporter Module — Markdown and Org Export

- [x] 5.1 Implement `exportAsMarkdown(state: ExportState): string` — emit title line, key-value metadata, `## Roster` with numbered players + specializations, `## Pitchers` comma list, `## Catchers` comma list, `## Locks` if any
- [x] 5.2 Implement `exportAsOrg(state: ExportState): string` — same content using `#+TITLE:` / `#+KEY:` metadata and `*` section headings
- [x] 5.3 Define `ExportState` type covering all fields needed for a round-trippable export (team, date, innings, outfield, roster, pitchers, catchers, lockedFieldPositions)
- [x] 5.4 Specialization serialization: `spec: 1B×2, CF×2` inline after player name/number

## 6. UI — Import Section in Step 1

- [x] 6.1 Add `importOpen` boolean state and `importText` string state to `page.tsx`
- [x] 6.2 Add `importWarnings` string array state for inline parse feedback
- [x] 6.3 Render a disclosure button "↓ Import lineup file" at the top of the Step 1 card; toggles `importOpen`
- [x] 6.4 When `importOpen`, render a textarea bound to `importText` and a "Load" button
- [x] 6.5 Implement `handleImport()`: call `parseLineupFile(importText)`, merge `ParsedLineup` into component state (roster, pitchers, catchers, lockedFields, team name, date, innings, outfield format)
- [x] 6.6 After merge: if roster present + all P/C filled → call `generate()` directly; else if roster present + partial P/C → `goToAssignments()`; else remain on step 1
- [x] 6.7 Display `importWarnings` inline below the textarea (if any)
- [x] 6.8 Close import section after successful load

## 7. UI — Export Buttons in Steps 2 and 3

- [x] 7.1 Implement `handleExport(format: "markdown" | "org")`: build `ExportState` from current component state, call the appropriate exporter, copy to clipboard via `navigator.clipboard.writeText`
- [x] 7.2 Add clipboard fallback: if Clipboard API unavailable, show a readonly textarea with the export text
- [x] 7.3 Add `copiedFormat` state (`"markdown" | "org" | null`) to track which button shows "Copied!" confirmation; auto-clear after 2 seconds
- [x] 7.4 Render "Copy as Markdown" and "Copy as Org" buttons in Step 2 (below the generate button row)
- [x] 7.5 Render "Copy as Markdown" and "Copy as Org" buttons in Step 3 (alongside the Export .docx button)
- [x] 7.6 Show brief "Copied!" label next to the clicked button while `copiedFormat` matches

## 8. Verification

- [x] 8.1 Manual round-trip test: enter a full lineup in GUI, export as markdown, paste back in import, confirm auto-generation produces identical result
- [x] 8.2 Manual round-trip test: repeat with org format
- [x] 8.3 Test partial import: paste file with roster only, confirm landing on Step 1 with roster pre-filled
- [x] 8.4 Test auto-generate: paste complete file, confirm Step 3 result appears without manual clicks
- [x] 8.5 TypeScript type check passes with no errors
