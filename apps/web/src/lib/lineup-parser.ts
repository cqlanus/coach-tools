import type { Player, OutfieldFormat, Specialization } from "./lineup-engine";

// ── Public types ─────────────────────────────────────────────────────────────

export interface ParsedLineup {
  teamName?: string;
  gameDate?: string;
  innings?: number;
  outfieldFormat?: OutfieldFormat;
  roster?: Player[];
  pitchers?: string[];
  catchers?: string[];
  lockedFieldPositions?: Array<Record<string, string>>;
}

export interface ExportState {
  teamName: string;
  gameDate: string;
  innings: number;
  outfieldFormat: OutfieldFormat;
  roster: Player[];
  pitchers: string[];
  catchers: string[];
  lockedFieldPositions: Array<Record<string, string>>;
}

// ── Normalization ─────────────────────────────────────────────────────────────

function normalizeText(raw: string): string {
  return raw
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .split('\n')
    .map(l => l.trimEnd())
    .join('\n');
}

// ── Format detection ──────────────────────────────────────────────────────────

function detectFormat(text: string): "markdown" | "org" {
  return /^\#\+[A-Z]+:/m.test(text) ? "org" : "markdown";
}

// ── Section extraction ────────────────────────────────────────────────────────

interface Extracted {
  preamble: string;
  sections: Record<string, string>;
}

function extractSections(text: string, format: "markdown" | "org"): Extracted {
  const lines = text.split('\n');
  const sections: Record<string, string> = {};
  const preambleLines: string[] = [];
  let currentSection: string | null = null;
  let sectionLines: string[] = [];

  for (const line of lines) {
    const isHeading = format === "org"
      ? /^\* [^*]/.test(line)
      : /^## /.test(line);

    if (isHeading) {
      if (currentSection !== null) {
        sections[currentSection] = sectionLines.join('\n').trim();
      }
      currentSection = line.replace(/^[#*]+\s+/, '').trim().toLowerCase();
      sectionLines = [];
    } else if (currentSection === null) {
      preambleLines.push(line);
    } else {
      sectionLines.push(line);
    }
  }

  if (currentSection !== null) {
    sections[currentSection] = sectionLines.join('\n').trim();
  }

  return { preamble: preambleLines.join('\n').trim(), sections };
}

// ── Metadata parsing ──────────────────────────────────────────────────────────

function parseOutfield(value: string): OutfieldFormat | undefined {
  const v = value.toLowerCase().replace(/\s+/g, '-');
  if (v === '4-outfielder') return '4-outfielder';
  if (v === 'standard') return 'standard';
  return undefined;
}

function extractMetadata(preamble: string, format: "markdown" | "org"): Partial<ParsedLineup> {
  const result: Partial<ParsedLineup> = {};
  const lines = preamble.split('\n').map(l => l.trim()).filter(Boolean);

  if (format === "org") {
    for (const line of lines) {
      const m = line.match(/^\#\+([A-Z]+):\s*(.*)$/i);
      if (!m) continue;
      const [, key, value] = m;
      switch (key.toUpperCase()) {
        case 'TITLE':    result.teamName = value.trim(); break;
        case 'DATE':     result.gameDate = value.trim(); break;
        case 'INNINGS':  { const n = parseInt(value.trim(), 10); if (n) result.innings = n; break; }
        case 'OUTFIELD': result.outfieldFormat = parseOutfield(value.trim()); break;
      }
    }
  } else {
    for (const line of lines) {
      if (line.startsWith('# ')) {
        result.teamName = line.replace(/^# /, '').trim();
        continue;
      }
      const m = line.match(/^([A-Za-z]+):\s*(.+)$/);
      if (!m) continue;
      const [, key, value] = m;
      switch (key.toLowerCase()) {
        case 'date':     result.gameDate = value.trim(); break;
        case 'innings':  { const n = parseInt(value.trim(), 10); if (n) result.innings = n; break; }
        case 'outfield': result.outfieldFormat = parseOutfield(value.trim()); break;
      }
    }
    // Also check for bare title (first non-empty, non-key-value, non-# line)
    if (!result.teamName) {
      const bare = lines.find(l => !l.startsWith('#') && !/^[A-Za-z]+:/.test(l));
      if (bare) result.teamName = bare;
    }
  }

  return result;
}

// ── Roster parsing ────────────────────────────────────────────────────────────

function parseSpecializations(clause: string): Specialization[] {
  const specs: Specialization[] = [];
  for (const part of clause.split(',')) {
    const m = part.trim().match(/^([A-Z0-9]+)\s*[×xX]\s*(\d+)$/i);
    if (m) {
      specs.push({ position: m[1].toUpperCase(), targetInnings: parseInt(m[2], 10) });
    }
  }
  return specs;
}

function parseRoster(section: string): Player[] {
  const players: Player[] = [];
  for (const line of section.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Strip leading list marker: "1.", "1)", "-", "*"
    const stripped = trimmed.replace(/^[\d]+[.)]\s*/, '').replace(/^[-*]\s*/, '');

    // Extract spec clause before other parsing
    const specMatch = stripped.match(/\bspec:\s*(.+)$/i);
    const withoutSpec = specMatch ? stripped.slice(0, specMatch.index).trim() : stripped;

    // Extract jersey number
    const numberMatch = withoutSpec.match(/#(\w+)\s*$/);
    const name = numberMatch ? withoutSpec.slice(0, numberMatch.index).trim() : withoutSpec.trim();
    const number = numberMatch ? numberMatch[1] : undefined;

    if (!name) continue;

    const specializations = specMatch ? parseSpecializations(specMatch[1]) : undefined;
    players.push({ name, number, specializations });
  }
  return players;
}

// ── Assignment parsing ────────────────────────────────────────────────────────

function parseCommaSeparatedNames(section: string): string[] {
  const text = section.split('\n').map(l => l.trim()).filter(Boolean).join(' ');
  return text.split(',').map(s => s.trim());
}

function parseLocks(section: string, innings: number): Array<Record<string, string>> {
  const locks: Array<Record<string, string>> = Array.from({ length: innings }, () => ({}));
  for (const line of section.split('\n')) {
    const m = line.trim().match(/^(\d+)\/([A-Z0-9]+):\s*(.+)$/i);
    if (!m) continue;
    const inning = parseInt(m[1], 10);
    const position = m[2].toUpperCase();
    const player = m[3].trim();
    if (inning >= 1 && inning <= innings) {
      locks[inning - 1][position] = player;
    }
  }
  return locks;
}

function resolveNames(names: string[], roster: Player[]): string[] {
  return names.map(name => {
    if (!name) return '';
    const lower = name.toLowerCase();
    const match = roster.find(p => p.name.toLowerCase() === lower);
    return match ? match.name : name;
  });
}

// ── Top-level parse ───────────────────────────────────────────────────────────

export function parseLineupFile(raw: string): { result: ParsedLineup; warnings: string[] } {
  const warnings: string[] = [];
  const normalized = normalizeText(raw);
  const format = detectFormat(normalized);
  const { preamble, sections } = extractSections(normalized, format);

  const result: ParsedLineup = {};

  Object.assign(result, extractMetadata(preamble, format));

  if (sections['roster']) {
    result.roster = parseRoster(sections['roster']);
    if (result.roster.length === 0) {
      warnings.push('Roster section found but no players could be parsed.');
    }
  }

  if (sections['pitchers']) {
    const names = parseCommaSeparatedNames(sections['pitchers']);
    result.pitchers = result.roster ? resolveNames(names, result.roster) : names;
  }

  if (sections['catchers']) {
    const names = parseCommaSeparatedNames(sections['catchers']);
    result.catchers = result.roster ? resolveNames(names, result.roster) : names;
  }

  if (sections['locks']) {
    const innings = result.innings ?? 6;
    const rawLocks = parseLocks(sections['locks'], innings);
    result.lockedFieldPositions = result.roster
      ? rawLocks.map(inningLocks =>
          Object.fromEntries(
            Object.entries(inningLocks).map(([pos, name]) => {
              const match = result.roster!.find(p => p.name.toLowerCase() === name.toLowerCase());
              return [pos, match ? match.name : name];
            })
          )
        )
      : rawLocks;
  }

  const hasContent = result.roster?.length || result.pitchers || result.catchers || result.teamName;
  if (!hasContent) {
    warnings.push('Could not parse lineup file — check the format.');
  }

  return { result, warnings };
}

// ── Export ────────────────────────────────────────────────────────────────────

function formatRosterLine(player: Player, idx: number): string {
  let line = `${idx + 1}. ${player.name}`;
  if (player.number) line += ` #${player.number}`;
  if (player.specializations?.length) {
    const specs = player.specializations
      .filter(s => s.position && s.targetInnings)
      .map(s => `${s.position}×${s.targetInnings}`)
      .join(', ');
    if (specs) line += `  spec: ${specs}`;
  }
  return line;
}

function formatLocks(lockedFieldPositions: Array<Record<string, string>>): string {
  const lines: string[] = [];
  lockedFieldPositions.forEach((inningLocks, i) => {
    Object.entries(inningLocks).forEach(([pos, player]) => {
      if (player) lines.push(`${i + 1}/${pos}: ${player}`);
    });
  });
  return lines.join('\n');
}

export function exportAsMarkdown(state: ExportState): string {
  const parts: string[] = [
    `# ${state.teamName || 'Team'}`,
    `Date: ${state.gameDate}`,
    `Innings: ${state.innings}`,
    `Outfield: ${state.outfieldFormat}`,
    '',
    '## Roster',
    state.roster.map(formatRosterLine).join('\n'),
    '',
    '## Pitchers',
    state.pitchers.join(', '),
    '',
    '## Catchers',
    state.catchers.join(', '),
  ];

  const locksText = formatLocks(state.lockedFieldPositions);
  if (locksText) {
    parts.push('', '## Locks', locksText);
  }

  return parts.join('\n');
}

export function exportAsOrg(state: ExportState): string {
  const parts: string[] = [
    `#+TITLE: ${state.teamName || 'Team'}`,
    `#+DATE: ${state.gameDate}`,
    `#+INNINGS: ${state.innings}`,
    `#+OUTFIELD: ${state.outfieldFormat}`,
    '',
    '* Roster',
    state.roster.map(formatRosterLine).join('\n'),
    '',
    '* Pitchers',
    state.pitchers.join(', '),
    '',
    '* Catchers',
    state.catchers.join(', '),
  ];

  const locksText = formatLocks(state.lockedFieldPositions);
  if (locksText) {
    parts.push('', '* Locks', locksText);
  }

  return parts.join('\n');
}
