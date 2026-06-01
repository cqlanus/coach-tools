export interface Specialization {
  position: string;
  targetInnings: number;
}

export interface Player {
  name: string;
  number?: string;
  specializations?: Specialization[];
}

export interface SpecializationResult {
  player: string;
  position: string;
  target: number;
  achieved: number;
}

export type OutfieldFormat = "standard" | "4-outfielder";

export interface LineupInput {
  date: string;
  teamName: string;
  innings: number;
  battingOrder: Player[];
  pitchers: string[];
  catchers: string[];
  outfieldFormat: OutfieldFormat;
  lockedFieldPositions?: Array<Record<string, string>>;
}

export interface InningAssignment {
  inning: number;
  pitcher: string;
  catcher: string;
  bench: string[];
  field: Record<string, string>;
}

export interface LineupResult {
  assignments: InningAssignment[];
  positionTotals: Record<string, string[]>;
  repeats: number;
  conflictErrors: string[];
  specializationResults: SpecializationResult[];
}

export const FIELD_POSITIONS: Record<string, string[]> = {
  standard:       ["1B", "2B", "3B", "SS", "LF", "CF", "RF"],
  "4-outfielder": ["1B", "2B", "3B", "SS", "LF", "LC", "RC", "RF"],
  "8p":           ["1B", "2B", "3B", "SS", "LF", "RF"],
};

export const DISPLAY_POSITIONS: Record<string, string[]> = {
  standard:       ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"],
  "4-outfielder": ["P", "C", "1B", "2B", "3B", "SS", "LF", "LC", "RC", "RF"],
  "8p":           ["P", "C", "1B", "2B", "3B", "SS", "LF", "RF"],
};

const POS_ORDERS_STANDARD = [
  ["1B", "2B", "3B", "SS", "LF", "CF", "RF"],
  ["RF", "CF", "LF", "SS", "3B", "2B", "1B"],
  ["SS", "3B", "2B", "1B", "LF", "CF", "RF"],
  ["LF", "CF", "RF", "SS", "1B", "3B", "2B"],
  ["3B", "SS", "CF", "1B", "RF", "LF", "2B"],
  ["2B", "1B", "SS", "3B", "LF", "RF", "CF"],
];

const POS_ORDERS_4OF = [
  ["1B", "2B", "3B", "SS", "LF", "LC", "RC", "RF"],
  ["RF", "RC", "LC", "LF", "SS", "3B", "2B", "1B"],
  ["LC", "RC", "LF", "RF", "SS", "1B", "3B", "2B"],
  ["SS", "3B", "2B", "1B", "RF", "LF", "LC", "RC"],
  ["LF", "RF", "LC", "RC", "1B", "SS", "2B", "3B"],
  ["3B", "SS", "RC", "LC", "1B", "RF", "2B", "LF"],
  ["2B", "1B", "SS", "3B", "LC", "RF", "LF", "RC"],
  ["RC", "LF", "SS", "2B", "RF", "1B", "LC", "3B"],
];

function tryAssign(
  posIdx: number,
  assigned: Set<string>,
  posLeft: string[],
  players: string[],
  result: Record<string, string>,
  history: Record<string, Set<string>>
): Record<string, string> | null {
  if (posIdx === posLeft.length) return result;

  const pos = posLeft[posIdx];
  const available = players.filter(p => !assigned.has(p));

  const sorted = [...available].sort((a, b) => {
    const aFresh = history[a].has(pos) ? 1 : 0;
    const bFresh = history[b].has(pos) ? 1 : 0;
    if (aFresh !== bFresh) return aFresh - bFresh;
    return history[a].size - history[b].size;
  });

  for (const player of sorted) {
    const next = new Set(assigned);
    next.add(player);
    const final = tryAssign(posIdx + 1, next, posLeft, players, { ...result, [pos]: player }, history);
    if (final) return final;
  }
  return null;
}

function planBench(
  allPlayers: string[],
  innings: number,
  fixed: Array<{ pitcher: string; catcher: string }>,
  lockedField: Array<Record<string, string>>,
  benchPerInning: number
): string[][] {
  if (benchPerInning <= 0) return Array.from({ length: innings }, () => []);

  const duties: Record<string, number> = Object.fromEntries(allPlayers.map(p => [p, 0]));
  fixed.forEach(({ pitcher, catcher }) => { duties[pitcher]++; duties[catcher]++; });
  lockedField.forEach(locks => {
    Object.values(locks).forEach(player => { if (duties[player] !== undefined) duties[player]++; });
  });

  const totalSlots = benchPerInning * innings;
  const base = Math.floor(totalSlots / allPlayers.length);
  const extra = totalSlots % allPlayers.length;

  const sortedByDuty = [...allPlayers].sort((a, b) => duties[a] - duties[b]);
  const targets: Record<string, number> = Object.fromEntries(
    sortedByDuty.map((p, i) => [p, base + (i < extra ? 1 : 0)])
  );

  const bench: string[][] = Array.from({ length: innings }, () => []);
  const counts: Record<string, number> = Object.fromEntries(allPlayers.map(p => [p, 0]));

  for (let i = 0; i < innings; i++) {
    const { pitcher, catcher } = fixed[i];
    const lockedPlayers = Object.values(lockedField[i] ?? {});
    const available = allPlayers
      .filter(p => p !== pitcher && p !== catcher && !lockedPlayers.includes(p) && counts[p] < targets[p])
      .sort((a, b) => duties[a] !== duties[b] ? duties[a] - duties[b] : counts[a] - counts[b]);

    for (let j = 0; j < benchPerInning && j < available.length; j++) {
      bench[i].push(available[j]);
      counts[available[j]]++;
    }

    if (bench[i].length < benchPerInning) {
      const fallback = allPlayers
        .filter(p => p !== pitcher && p !== catcher && !lockedPlayers.includes(p) && !bench[i].includes(p))
        .sort((a, b) => counts[a] - counts[b]);
      for (const fb of fallback) {
        if (bench[i].length >= benchPerInning) break;
        bench[i].push(fb);
        counts[fb]++;
      }
    }
  }

  return bench;
}

export function generateLineup(input: LineupInput): LineupResult {
  const { innings, battingOrder, pitchers, catchers, outfieldFormat, lockedFieldPositions } = input;
  const allPlayers = battingOrder.map(p => p.name);
  const specPlayers = battingOrder.filter(p => p.specializations?.length);

  const locked: Array<Record<string, string>> = Array.from({ length: innings }, (_, i) =>
    lockedFieldPositions?.[i] ?? {}
  );

  const conflictErrors: string[] = [];
  for (let i = 0; i < innings; i++) {
    if (pitchers[i] && catchers[i] && pitchers[i] === catchers[i]) {
      conflictErrors.push(`Inning ${i + 1}: ${pitchers[i]} cannot be both pitcher and catcher`);
    }
    const inningLocks = locked[i];
    const seenLocked = new Set<string>();
    for (const [pos, player] of Object.entries(inningLocks)) {
      if (!player) continue;
      if (player === pitchers[i]) conflictErrors.push(`Inning ${i + 1}: ${player} is locked to ${pos} but also pitching`);
      if (player === catchers[i]) conflictErrors.push(`Inning ${i + 1}: ${player} is locked to ${pos} but also catching`);
      if (seenLocked.has(player)) conflictErrors.push(`Inning ${i + 1}: ${player} is locked to multiple positions`);
      seenLocked.add(player);
    }
  }

  const fixed = pitchers.map((pitcher, i) => ({ pitcher, catcher: catchers[i] }));

  const use4OF = outfieldFormat === "4-outfielder";
  const use8P = allPlayers.length === 8 && !use4OF;
  const fieldKey = use4OF ? "4-outfielder" : use8P ? "8p" : "standard";
  const positionsPerInning = use4OF ? 10 : use8P ? 8 : 9;
  const benchPerInning = Math.max(0, allPlayers.length - positionsPerInning);
  const posOrders = use4OF ? POS_ORDERS_4OF : POS_ORDERS_STANDARD;
  const fieldPos = FIELD_POSITIONS[fieldKey];

  const bench = planBench(allPlayers, innings, fixed, locked, benchPerInning);

  let bestAssignments: Array<Record<string, string>> | null = null;
  let bestRepeats = Infinity;
  let bestHistory: Record<string, string[]> | null = null;
  let bestSpecAchieved: Record<string, Record<string, number>> | null = null;

  for (const posOrder of posOrders) {
    const hist: Record<string, Set<string>> = Object.fromEntries(
      allPlayers.map(p => [p, new Set<string>()])
    );
    const asgn: Array<Record<string, string>> = [];
    let ok = true;

    // Per-posOrder specialization fulfillment tracking
    const specAchievedThis: Record<string, Record<string, number>> = Object.fromEntries(
      specPlayers.map(p => [p.name, Object.fromEntries((p.specializations ?? []).map(s => [s.position, 0]))])
    );

    for (let i = 0; i < innings; i++) {
      const { pitcher, catcher } = fixed[i];
      const benchThis = bench[i];

      // Start with hard locks; inject specialization soft locks on top
      const lockedThisInning: Record<string, string> = { ...locked[i] };

      if (specPlayers.length > 0) {
        const hardLockedPlayers = new Set(Object.values(locked[i]));
        const hardLockedPositions = new Set(Object.keys(locked[i]));
        const positionCandidates: Record<string, Array<{ player: string; remaining: number; battingIdx: number }>> = {};

        for (let pi = 0; pi < battingOrder.length; pi++) {
          const player = battingOrder[pi];
          const name = player.name;
          if (!player.specializations?.length) continue;
          if (name === pitcher || name === catcher || benchThis.includes(name) || hardLockedPlayers.has(name)) continue;

          const eligible = player.specializations
            .filter(s => s.position && !hardLockedPositions.has(s.position))
            .map(s => ({ position: s.position, remaining: s.targetInnings - (specAchievedThis[name]?.[s.position] ?? 0) }))
            .filter(s => s.remaining > 0)
            .sort((a, b) => b.remaining - a.remaining);

          if (!eligible.length) continue;
          const best = eligible[0];
          if (!positionCandidates[best.position]) positionCandidates[best.position] = [];
          positionCandidates[best.position].push({ player: name, remaining: best.remaining, battingIdx: pi });
        }

        for (const [pos, candidates] of Object.entries(positionCandidates)) {
          candidates.sort((a, b) => b.remaining - a.remaining || a.battingIdx - b.battingIdx);
          lockedThisInning[pos] = candidates[0].player;
        }
      }

      const lockedPositionKeys = Object.keys(lockedThisInning);
      const lockedPlayerValues = Object.values(lockedThisInning);

      const fieldPlayers = allPlayers.filter(
        p => p !== pitcher && p !== catcher && !benchThis.includes(p) && !lockedPlayerValues.includes(p)
      );
      const orderedPos = posOrder.filter(pos => fieldPos.includes(pos) && !lockedPositionKeys.includes(pos));

      const result = tryAssign(0, new Set(lockedPlayerValues), orderedPos, fieldPlayers, { ...lockedThisInning }, hist);
      if (!result) { ok = false; break; }

      // Increment specAchieved for soft locks that were fulfilled
      for (const [pos, player] of Object.entries(lockedThisInning)) {
        if (locked[i][pos] === player) continue; // skip hard locks
        if (result[pos] === player && specAchievedThis[player]?.[pos] !== undefined) {
          specAchievedThis[player][pos]++;
        }
      }

      hist[pitcher].add("P");
      hist[catcher].add("C");
      benchThis.forEach(b => hist[b].add("BENCH"));
      Object.entries(result).forEach(([pos, player]) => hist[player].add(pos));
      asgn.push(result);
    }

    if (!ok) continue;

    const fullHistory: Record<string, string[]> = Object.fromEntries(allPlayers.map(p => [p, []]));
    for (let i = 0; i < innings; i++) {
      fullHistory[fixed[i].pitcher].push("P");
      fullHistory[fixed[i].catcher].push("C");
      bench[i].forEach(b => fullHistory[b].push("BENCH"));
      Object.entries(asgn[i]).forEach(([pos, name]) => fullHistory[name].push(pos));
    }

    // Compute intentional (spec) repeats to subtract from raw count
    let specRepeats = 0;
    for (const player of specPlayers) {
      for (const spec of (player.specializations ?? [])) {
        const achieved = specAchievedThis[player.name]?.[spec.position] ?? 0;
        specRepeats += Math.max(0, Math.min(achieved, spec.targetInnings) - 1);
      }
    }

    let rawRepeats = 0;
    Object.values(fullHistory).forEach(positions => {
      const playing = positions.filter(p => p !== "BENCH");
      playing.forEach((p, i) => { if (playing.indexOf(p) !== i) rawRepeats++; });
    });

    const adjustedRepeats = rawRepeats - specRepeats;

    if (adjustedRepeats < bestRepeats) {
      bestRepeats = adjustedRepeats;
      bestAssignments = asgn;
      bestHistory = fullHistory;
      bestSpecAchieved = specAchievedThis;
      if (adjustedRepeats === 0) break;
    }
  }

  if (!bestAssignments || !bestHistory) {
    return {
      assignments: [],
      positionTotals: {},
      repeats: 0,
      conflictErrors: [
        ...conflictErrors,
        "Could not compute a valid assignment — check that all innings have pitchers and catchers assigned.",
      ],
      specializationResults: [],
    };
  }

  const specializationResults: SpecializationResult[] = [];
  for (const player of battingOrder) {
    for (const spec of (player.specializations ?? [])) {
      if (!spec.position) continue;
      specializationResults.push({
        player: player.name,
        position: spec.position,
        target: spec.targetInnings,
        achieved: bestSpecAchieved?.[player.name]?.[spec.position] ?? 0,
      });
    }
  }

  return {
    assignments: bestAssignments.map((field, i) => ({
      inning: i + 1,
      pitcher: fixed[i].pitcher,
      catcher: fixed[i].catcher,
      bench: bench[i],
      field,
    })),
    positionTotals: bestHistory,
    repeats: bestRepeats,
    conflictErrors,
    specializationResults,
  };
}
