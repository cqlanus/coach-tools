export interface Player {
  name: string;
  number?: string;
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
}

const FIELD_POSITIONS: Record<string, string[]> = {
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
  benchPerInning: number
): string[][] {
  if (benchPerInning <= 0) return Array.from({ length: innings }, () => []);

  const duties: Record<string, number> = Object.fromEntries(allPlayers.map(p => [p, 0]));
  fixed.forEach(({ pitcher, catcher }) => { duties[pitcher]++; duties[catcher]++; });

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
    const available = allPlayers
      .filter(p => p !== pitcher && p !== catcher && counts[p] < targets[p])
      .sort((a, b) => duties[a] !== duties[b] ? duties[a] - duties[b] : counts[a] - counts[b]);

    for (let j = 0; j < benchPerInning && j < available.length; j++) {
      bench[i].push(available[j]);
      counts[available[j]]++;
    }

    if (bench[i].length < benchPerInning) {
      const fallback = allPlayers
        .filter(p => p !== pitcher && p !== catcher && !bench[i].includes(p))
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
  const { innings, battingOrder, pitchers, catchers, outfieldFormat } = input;
  const allPlayers = battingOrder.map(p => p.name);

  const conflictErrors: string[] = [];
  for (let i = 0; i < innings; i++) {
    if (pitchers[i] && catchers[i] && pitchers[i] === catchers[i]) {
      conflictErrors.push(`Inning ${i + 1}: ${pitchers[i]} cannot be both pitcher and catcher`);
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

  const bench = planBench(allPlayers, innings, fixed, benchPerInning);

  let bestAssignments: Array<Record<string, string>> | null = null;
  let bestRepeats = Infinity;
  let bestHistory: Record<string, string[]> | null = null;

  for (const posOrder of posOrders) {
    const hist: Record<string, Set<string>> = Object.fromEntries(
      allPlayers.map(p => [p, new Set<string>()])
    );
    const asgn: Array<Record<string, string>> = [];
    let ok = true;

    for (let i = 0; i < innings; i++) {
      const { pitcher, catcher } = fixed[i];
      const benchThis = bench[i];
      const fieldPlayers = allPlayers.filter(
        p => p !== pitcher && p !== catcher && !benchThis.includes(p)
      );
      const orderedPos = posOrder.filter(pos => fieldPos.includes(pos));

      const result = tryAssign(0, new Set(), orderedPos, fieldPlayers, {}, hist);
      if (!result) { ok = false; break; }

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

    let repeats = 0;
    Object.values(fullHistory).forEach(positions => {
      const playing = positions.filter(p => p !== "BENCH");
      playing.forEach((p, i) => { if (playing.indexOf(p) !== i) repeats++; });
    });

    if (repeats < bestRepeats) {
      bestRepeats = repeats;
      bestAssignments = asgn;
      bestHistory = fullHistory;
      if (repeats === 0) break;
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
    };
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
  };
}
