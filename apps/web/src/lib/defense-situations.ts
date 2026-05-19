// ── Types ──────────────────────────────────────────────────────────────────

export type Position = "p" | "c" | "1b" | "2b" | "ss" | "3b" | "lf" | "cf" | "rf";

export type AssignmentType = "ball" | "cover" | "backup" | "cut" | "hold";

export interface PositionAssignment {
  role: AssignmentType;
  detail: string; // e.g. "Cover 1B", "Backup 3B", "Cutoff relay"
}

export type SituationMap = Record<Position, PositionAssignment>;

// base state: "1" = runner, "0" = empty  [1st, 2nd, 3rd]
export type BaseState = "000"|"100"|"010"|"001"|"110"|"101"|"011"|"111";

export type PlayType =
  | "gb_p" | "gb_c" | "gb_1b" | "gb_2b" | "gb_ss" | "gb_3b"
  | "gb_lf" | "gb_cf" | "gb_rf"
  | "dbl_ll" | "dbl_rl" | "dbl_lg" | "dbl_rg";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  group?: string;
}

// ── Option metadata ────────────────────────────────────────────────────────

export const BASE_STATE_OPTIONS: SelectOption<BaseState>[] = [
  { value: "000", label: "Bases empty" },
  { value: "100", label: "Runner on 1st" },
  { value: "010", label: "Runner on 2nd" },
  { value: "001", label: "Runner on 3rd" },
  { value: "110", label: "Runners on 1st & 2nd" },
  { value: "101", label: "Runners on 1st & 3rd" },
  { value: "011", label: "Runners on 2nd & 3rd" },
  { value: "111", label: "Bases loaded" },
];

export const PLAY_TYPE_OPTIONS: SelectOption<PlayType>[] = [
  // Infield ground balls
  { value: "gb_p",  label: "Pitcher",       group: "Infield Ground Ball" },
  { value: "gb_c",  label: "Catcher",        group: "Infield Ground Ball" },
  { value: "gb_1b", label: "First baseman",  group: "Infield Ground Ball" },
  { value: "gb_2b", label: "Second baseman", group: "Infield Ground Ball" },
  { value: "gb_ss", label: "Shortstop",      group: "Infield Ground Ball" },
  { value: "gb_3b", label: "Third baseman",  group: "Infield Ground Ball" },
  // Outfield ground balls
  { value: "gb_lf", label: "Left field",     group: "Outfield Ground Ball" },
  { value: "gb_cf", label: "Center field",   group: "Outfield Ground Ball" },
  { value: "gb_rf", label: "Right field",    group: "Outfield Ground Ball" },
  // Doubles
  { value: "dbl_ll", label: "Down left line",       group: "Double" },
  { value: "dbl_rl", label: "Down right line",      group: "Double" },
  { value: "dbl_lg", label: "Left-center gap",      group: "Double" },
  { value: "dbl_rg", label: "Right-center gap",     group: "Double" },
];

export const POSITION_LABELS: Record<Position, string> = {
  p:  "Pitcher",
  c:  "Catcher",
  "1b": "1B",
  "2b": "2B",
  ss: "SS",
  "3b": "3B",
  lf: "LF",
  cf: "CF",
  rf: "RF",
};

export const ASSIGNMENT_COLORS: Record<AssignmentType, string> = {
  ball:   "#3b82f6",  // blue
  cover:  "#22c55e",  // green
  backup: "#f59e0b",  // amber
  cut:    "#a78bfa",  // purple
  hold:   "#374151",  // dark gray
};

export const ASSIGNMENT_LABELS: Record<AssignmentType, string> = {
  ball:   "Ball",
  cover:  "Cover",
  backup: "Backup",
  cut:    "Cut / Relay",
  hold:   "Hold",
};

// ── SVG field coordinates ─────────────────────────────────────────────────
// viewBox "0 0 520 480" — origin top-left, home plate near bottom center

export const FIELD_POSITIONS: Record<Position, { cx: number; cy: number }> = {
  p:    { cx: 260, cy: 255 },
  c:    { cx: 260, cy: 370 },
  "1b": { cx: 355, cy: 280 },
  "2b": { cx: 320, cy: 210 },
  ss:   { cx: 200, cy: 210 },
  "3b": { cx: 165, cy: 280 },
  lf:   { cx: 110, cy: 155 },
  cf:   { cx: 260, cy:  95 },
  rf:   { cx: 410, cy: 155 },
};

export const BALL_POSITIONS: Record<PlayType, { cx: number; cy: number }> = {
  gb_p:   FIELD_POSITIONS.p,
  gb_c:   FIELD_POSITIONS.c,
  gb_1b:  FIELD_POSITIONS["1b"],
  gb_2b:  FIELD_POSITIONS["2b"],
  gb_ss:  FIELD_POSITIONS.ss,
  gb_3b:  FIELD_POSITIONS["3b"],
  gb_lf:  FIELD_POSITIONS.lf,
  gb_cf:  FIELD_POSITIONS.cf,
  gb_rf:  FIELD_POSITIONS.rf,
  dbl_ll: { cx:  55, cy: 200 },
  dbl_rl: { cx: 465, cy: 200 },
  dbl_lg: { cx: 120, cy: 125 },
  dbl_rg: { cx: 400, cy: 125 },
};

// ── Situation data ─────────────────────────────────────────────────────────
// Key format: `${baseState}:${playType}`
// This is the authoritative source — add/correct situations here.

type SituationKey = `${BaseState}:${PlayType}`;

function sit(
  p:  PositionAssignment,
  c:  PositionAssignment,
  b1: PositionAssignment,
  b2: PositionAssignment,
  ss: PositionAssignment,
  b3: PositionAssignment,
  lf: PositionAssignment,
  cf: PositionAssignment,
  rf: PositionAssignment,
): SituationMap {
  return { p, c, "1b": b1, "2b": b2, ss, "3b": b3, lf, cf, rf };
}

// Shorthand helpers
const B  = (detail: string): PositionAssignment => ({ role: "ball",   detail });
const CV = (detail: string): PositionAssignment => ({ role: "cover",  detail });
const BU = (detail: string): PositionAssignment => ({ role: "backup", detail });
const CT = (detail: string): PositionAssignment => ({ role: "cut",    detail });
const HO = (detail: string): PositionAssignment => ({ role: "hold",   detail });

export const SITUATIONS: Partial<Record<SituationKey, SituationMap>> = {

  // ── BASES EMPTY ──────────────────────────────────────────────────────────

  "000:gb_p": sit(
    B("Field, throw to 1B"),
    BU("Back up 1B"),
    CV("Cover 1B"),
    BU("Back up 2B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    HO("Hold"),
    HO("Hold"),
    HO("Hold"),
  ),
  "000:gb_c": sit(
    BU("Back up 1B"),
    B("Field, throw to 1B"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    HO("Hold"),
    HO("Hold"),
    HO("Hold"),
  ),
  "000:gb_1b": sit(
    CV("Cover 1B (banana route)"),
    BU("Back up 1B"),
    B("Field, flip to P covering 1B"),
    CV("Cover 2B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    HO("Hold"),
    HO("Hold"),
    HO("Hold"),
  ),
  "000:gb_2b": sit(
    BU("Back up 3B"),
    BU("Back up 1B"),
    CV("Cover 1B"),
    B("Field, throw to 1B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    HO("Hold"),
    HO("Hold"),
    HO("Hold"),
  ),
  "000:gb_ss": sit(
    BU("Back up 3B"),
    BU("Back up 1B"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    B("Field, throw to 1B"),
    CV("Cover 3B"),
    HO("Hold"),
    HO("Hold"),
    HO("Hold"),
  ),
  "000:gb_3b": sit(
    BU("Back up 3B"),
    BU("Back up 1B"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    CV("Cover 3B or 2B"),
    B("Field, throw to 1B"),
    HO("Hold"),
    HO("Hold"),
    HO("Hold"),
  ),
  "000:gb_lf": sit(
    BU("Back up 3B"),
    CV("Cover home"),
    CV("Cover 1B"),
    CT("Cutoff to 2B or 3B"),
    CT("Cutoff to 2B"),
    CV("Cover 3B"),
    B("Field, throw to cutoff"),
    BU("Back up LF"),
    HO("Hold"),
  ),
  "000:gb_cf": sit(
    HO("Hold"),
    CV("Cover home"),
    CV("Cover 1B"),
    CT("Cutoff to 2B"),
    CT("Cutoff to 2B"),
    CV("Cover 3B"),
    BU("Back up CF"),
    B("Field, throw to cutoff"),
    BU("Back up CF"),
  ),
  "000:gb_rf": sit(
    BU("Back up 1B"),
    CV("Cover home"),
    CV("Cover 1B"),
    CT("Cutoff to 2B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    HO("Hold"),
    BU("Back up RF"),
    B("Field, throw to cutoff"),
  ),
  "000:dbl_ll": sit(
    BU("Back up 3B"),
    CV("Cover home"),
    CV("Cover 1B"),
    CT("Cutoff — relay throw to 3B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    B("Chase ball down line"),
    BU("Back up LF"),
    HO("Hold"),
  ),
  "000:dbl_rl": sit(
    BU("Back up 1B"),
    CV("Cover home"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    CT("Cutoff — relay throw to 3B"),
    CV("Cover 3B"),
    HO("Hold"),
    BU("Back up RF"),
    B("Chase ball down line"),
  ),
  "000:dbl_lg": sit(
    BU("Back up 3B"),
    CV("Cover home"),
    CV("Cover 1B"),
    CT("Cutoff — relay to 3B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    B("Field ball in gap"),
    BU("Trail LF, back up"),
    HO("Hold"),
  ),
  "000:dbl_rg": sit(
    BU("Back up 3B"),
    CV("Cover home"),
    CV("Cover 1B"),
    CT("Cutoff — relay to 3B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    HO("Hold"),
    BU("Trail RF, back up"),
    B("Field ball in gap"),
  ),

  // ── RUNNER ON 1ST ────────────────────────────────────────────────────────

  "100:gb_p": sit(
    B("Field, throw to 2B"),
    BU("Back up 1B"),
    CV("Cover 1B"),
    CV("Cover 2B (receive throw)"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    BU("Back up 3B"),
    HO("Hold"),
    HO("Hold"),
  ),
  "100:gb_ss": sit(
    BU("Back up 3B"),
    BU("Back up 1B"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    B("Field, throw to 2B or 1B"),
    CV("Cover 3B"),
    BU("Back up 3B"),
    HO("Hold"),
    HO("Hold"),
  ),
  "100:gb_2b": sit(
    BU("Back up 3B"),
    BU("Back up 1B"),
    CV("Cover 1B"),
    B("Field, flip to SS at 2B"),
    CV("Cover 2B (receive flip)"),
    CV("Cover 3B"),
    BU("Back up 3B"),
    HO("Hold"),
    HO("Hold"),
  ),
  "100:gb_1b": sit(
    CV("Cover 1B"),
    BU("Back up 1B"),
    B("Field, throw to SS at 2B"),
    CV("Cover 2B"),
    CV("Cover 2B (receive throw)"),
    CV("Cover 3B"),
    BU("Back up 3B"),
    HO("Hold"),
    HO("Hold"),
  ),
  "100:gb_3b": sit(
    BU("Back up 3B"),
    BU("Back up 1B"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    CV("Cover 2B"),
    B("Field, throw to 2B or 1B"),
    HO("Hold"),
    HO("Hold"),
    HO("Hold"),
  ),
  "100:gb_lf": sit(
    BU("Back up 3B"),
    CV("Cover home"),
    CV("Cover 1B"),
    CT("Cutoff to 3B or home"),
    CT("Cover 2B / trail cutoff"),
    CV("Cover 3B"),
    B("Field, throw to cutoff"),
    BU("Back up LF"),
    HO("Hold"),
  ),
  "100:gb_rf": sit(
    BU("Back up 2B"),
    CV("Cover home"),
    CV("Cover 1B"),
    CT("Cutoff to 3B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    HO("Hold"),
    BU("Back up RF"),
    B("Field, throw to cutoff"),
  ),
  "100:dbl_lg": sit(
    BU("Back up 3B / home"),
    CV("Cover home"),
    CV("Cover 1B"),
    CT("Cutoff — relay to home"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    B("Field ball in gap"),
    BU("Trail, back up"),
    HO("Hold"),
  ),
  "100:dbl_rg": sit(
    BU("Back up 3B / home"),
    CV("Cover home"),
    CV("Cover 1B"),
    CT("Cutoff — relay to home"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    HO("Hold"),
    BU("Trail RF, back up"),
    B("Field ball in gap"),
  ),

  // ── RUNNER ON 2ND ────────────────────────────────────────────────────────

  "010:gb_p": sit(
    B("Field, throw to 1B (hold runner)"),
    BU("Back up 3B"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    CV("Cover 3B"),
    HO("Hold"),
    HO("Hold"),
    HO("Hold"),
  ),
  "010:gb_ss": sit(
    BU("Back up 3B"),
    BU("Back up home"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    B("Field, check runner, throw to 1B"),
    CV("Cover 3B"),
    HO("Hold"),
    HO("Hold"),
    HO("Hold"),
  ),
  "010:gb_lf": sit(
    BU("Back up home"),
    CV("Cover home"),
    CV("Cover 1B"),
    CT("Cutoff — relay to home"),
    CV("Cover 2B"),
    CV("Cover 3B / trail to home"),
    B("Field, throw to cutoff"),
    BU("Back up LF"),
    HO("Hold"),
  ),
  "010:gb_rf": sit(
    BU("Back up home"),
    CV("Cover home"),
    CV("Cover 1B"),
    CT("Cutoff to home"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    HO("Hold"),
    BU("Back up RF"),
    B("Field, throw to cutoff"),
  ),

  // ── RUNNER ON 3RD ────────────────────────────────────────────────────────

  "001:gb_p": sit(
    B("Field, throw to home or 1B"),
    CV("Cover home"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    HO("Hold"),
    HO("Hold"),
    HO("Hold"),
  ),
  "001:gb_ss": sit(
    BU("Back up home"),
    CV("Cover home"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    B("Field, throw home or 1B"),
    CV("Cover 3B"),
    HO("Hold"),
    HO("Hold"),
    HO("Hold"),
  ),

  // ── RUNNERS ON 1ST & 2ND ─────────────────────────────────────────────────

  "110:gb_p": sit(
    B("Field, throw to 3B or 2B"),
    BU("Back up home"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    CV("Cover 3B"),
    BU("Back up 3B"),
    HO("Hold"),
    HO("Hold"),
  ),
  "110:gb_ss": sit(
    BU("Back up 3B"),
    BU("Back up home"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    B("Field, throw to 3B or 2B"),
    CV("Cover 3B"),
    BU("Back up 3B"),
    HO("Hold"),
    HO("Hold"),
  ),
  "110:gb_2b": sit(
    BU("Back up 3B"),
    BU("Back up home"),
    CV("Cover 1B"),
    B("Field, throw to 3B or 2B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    BU("Back up 3B"),
    HO("Hold"),
    HO("Hold"),
  ),

  // ── RUNNERS ON 1ST & 3RD ─────────────────────────────────────────────────

  "101:gb_p": sit(
    B("Field, throw to home or 2B"),
    CV("Cover home"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    HO("Hold"),
    HO("Hold"),
    HO("Hold"),
  ),

  // ── RUNNERS ON 2ND & 3RD ─────────────────────────────────────────────────

  "011:gb_p": sit(
    B("Field, throw to home"),
    CV("Cover home"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    CV("Cover 3B"),
    BU("Back up home"),
    HO("Hold"),
    HO("Hold"),
  ),

  // ── BASES LOADED ─────────────────────────────────────────────────────────

  "111:gb_p": sit(
    B("Field, throw to home or 2B"),
    CV("Cover home"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    CV("Cover 3B"),
    CV("Cover 3B"),
    BU("Back up home"),
    HO("Hold"),
    HO("Hold"),
  ),
  "111:gb_ss": sit(
    BU("Back up home"),
    CV("Cover home"),
    CV("Cover 1B"),
    CV("Cover 2B"),
    B("Field, throw to home or 2B"),
    CV("Cover 3B"),
    BU("Back up home"),
    HO("Hold"),
    HO("Hold"),
  ),
};

// ── Lookup helper ──────────────────────────────────────────────────────────

/** Get the situation map for a given base state + play type.
 *  Returns null if not yet defined (shows "coming soon" in UI). */
export function getSituation(
  base: BaseState,
  play: PlayType,
): SituationMap | null {
  const key: SituationKey = `${base}:${play}`;
  return SITUATIONS[key] ?? null;
}
