import type { LineupInput, LineupResult } from "./lineup-engine";

export interface SavedLineup {
  id: string;
  savedAt: string;
  input: LineupInput;
  result: LineupResult;
}

const STORAGE_KEY = "lineup_history";

function matchKey(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function loadHistory(): SavedLineup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedLineup[];
  } catch {
    return [];
  }
}

export function saveLineup(input: LineupInput, result: LineupResult): void {
  const entry: SavedLineup = {
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
    input,
    result,
  };
  const existing = loadHistory();
  const idx = existing.findIndex(
    s => matchKey(s.input.teamName, input.teamName) && s.input.date === input.date,
  );
  const updated =
    idx >= 0
      ? [entry, ...existing.slice(0, idx), ...existing.slice(idx + 1)]
      : [entry, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // storage unavailable — silently skip
  }
}

export function deleteLineup(id: string): void {
  const updated = loadHistory().filter(s => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // storage unavailable
  }
}
