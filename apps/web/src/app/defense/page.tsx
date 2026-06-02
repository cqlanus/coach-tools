"use client";

import { useState } from "react";
import { TopNav } from "@/components/ui/TopNav";
import { FieldDiagram } from "@/components/defense/FieldDiagram";
import {
  BaseState,
  PlayType,
  Position,
  BASE_STATE_OPTIONS,
  PLAY_TYPE_OPTIONS,
  ASSIGNMENT_COLORS,
  ASSIGNMENT_LABELS,
  POSITION_LABELS,
  getSituation,
} from "@/lib/defense-situations";
import defenseClipsRaw from "@/data/defense-clips.json";

type ClipEntry = { play_id: string; video_url: string; game_date: string; matchup: string };
const defenseClips = defenseClipsRaw as Record<string, ClipEntry[]>;

function buildSavantSearchUrl(play: PlayType, base: BaseState): string {
  const eventMap: Partial<Record<PlayType, string>> = {
    gb_p: "field_out%7C", gb_c: "field_out%7C", gb_1b: "field_out%7C",
    gb_2b: "field_out%7C", gb_ss: "field_out%7C", gb_3b: "field_out%7C",
    gb_lf: "single%7C", gb_cf: "single%7C", gb_rf: "single%7C",
    dbl_ll: "double%7C", dbl_rl: "double%7C", dbl_lg: "double%7C", dbl_rg: "double%7C",
  };
  const locMap: Partial<Record<PlayType, string>> = {
    gb_p: "1", gb_c: "2", gb_1b: "3", gb_2b: "4", gb_ss: "6", gb_3b: "5",
    gb_lf: "7", gb_cf: "8", gb_rf: "9",
  };
  const bbMap: Partial<Record<PlayType, string>> = {
    gb_p: "ground_ball", gb_c: "ground_ball", gb_1b: "ground_ball",
    gb_2b: "ground_ball", gb_ss: "ground_ball", gb_3b: "ground_ball",
    gb_lf: "ground_ball", gb_cf: "ground_ball", gb_rf: "ground_ball",
  };
  const event = eventMap[play] ?? "field_out%7C";
  const loc   = locMap[play];
  const bb    = bbMap[play];
  const r1 = base[0] === "1", r2 = base[1] === "1", r3 = base[2] === "1";
  let ro = "";
  if (!r1 && !r2 && !r3) ro = "Empty%7C";
  else if (r1 || r2 || r3) ro = "Men_On%7C";
  let url = `https://baseballsavant.mlb.com/statcast_search?hfGT=R%7C&hfSea=2024%7C2023%7C&player_type=batter&hfAB=${event}&type=details`;
  if (bb)  url += `&bb_type=${bb}`;
  if (loc) url += `&hit_location=${loc}`;
  if (ro)  url += `&hfRO=${ro}`;
  return url;
}

export default function DefensePage() {
  const [baseState, setBaseState] = useState<BaseState>("000");
  const [playType,  setPlayType]  = useState<PlayType>("gb_ss");
  const [activePos, setActivePos] = useState<Position | null>(null);

  const situation = getSituation(baseState, playType);
  const clips = defenseClips[`${baseState}:${playType}`] ?? [];

  // Group play type options by group label
  const playGroups = PLAY_TYPE_OPTIONS.reduce<Record<string, typeof PLAY_TYPE_OPTIONS>>(
    (acc, opt) => {
      const g = opt.group ?? "Other";
      if (!acc[g]) acc[g] = [];
      acc[g].push(opt);
      return acc;
    },
    {}
  );

  const activeAssignment = activePos && situation ? situation[activePos] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">

        {/* Page title */}
        <div>
          <p className="section-label mb-1">Tool</p>
          <h1 className="font-display font-extrabold text-2xl text-cream">
            Defensive Responsibilities
          </h1>
          <p className="text-cream/50 text-sm mt-1">
            Select a base situation and ball in play to see every player's assignment.
          </p>
        </div>

        {/* Controls + field — side by side on wide, stacked on mobile */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Controls */}
          <div className="lg:w-72 shrink-0 flex flex-col gap-4">

            {/* Base state */}
            <div className="card p-4 flex flex-col gap-2">
              <label className="section-label">Base situation</label>
              <div className="grid grid-cols-2 gap-2">
                {BASE_STATE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBaseState(opt.value)}
                    className={`text-xs font-sans px-2 py-2 rounded-md text-left transition-colors border
                      ${baseState === opt.value
                        ? "bg-navy-light border-red text-cream"
                        : "bg-white/5 border-white/10 text-cream/60 hover:border-white/25 hover:text-cream"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ball in play */}
            <div className="card p-4 flex flex-col gap-2">
              <label className="section-label">Ball in play</label>
              <select
                value={playType}
                onChange={(e) => setPlayType(e.target.value as PlayType)}
                className="bg-navy-light/40 border border-white/15 text-cream text-sm rounded-lg
                           px-3 py-2 focus:outline-none focus:border-red/60 w-full"
              >
                {Object.entries(playGroups).map(([group, opts]) => (
                  <optgroup key={group} label={group}>
                    {opts.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Legend */}
            <div className="card p-4 flex flex-col gap-2">
              <p className="section-label">Legend</p>
              <div className="flex flex-col gap-1.5">
                {(Object.entries(ASSIGNMENT_LABELS) as [keyof typeof ASSIGNMENT_LABELS, string][]).map(
                  ([role, label]) => (
                    <div key={role} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: ASSIGNMENT_COLORS[role] }}
                      />
                      <span className="text-xs text-cream/70">{label}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Field + detail panel */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">

            {/* Field diagram */}
            <div
              className="card overflow-hidden rounded-xl"
              style={{ background: "#0f2417" }}
            >
              <div className="aspect-[4/3] w-full">
                <FieldDiagram
                  situation={situation}
                  play={playType}
                  activePosition={activePos}
                  onPositionHover={setActivePos}
                />
              </div>
            </div>

            {/* Clip links + Statcast search */}
            <div className="flex flex-wrap items-center gap-2 px-1">
              {clips.map((clip, i) => (
                <a
                  key={clip.play_id}
                  href={clip.video_url}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border
                    border-green-500/30 text-green-400 text-xs font-display font-semibold
                    hover:border-green-400/60 hover:bg-green-400/5 transition-colors"
                >
                  ▶ Example {i + 1}
                </a>
              ))}
              <a
                href={buildSavantSearchUrl(playType, baseState)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-xs text-cream/40
                  hover:text-cream/70 transition-colors font-display font-semibold"
              >
                Browse Statcast ↗
              </a>
            </div>

            {/* Situation not defined yet */}
            {!situation && (
              <div className="card p-4 text-center">
                <p className="text-cream/40 text-sm">
                  This situation hasn't been mapped yet — coming soon.
                </p>
              </div>
            )}

            {/* Active position detail */}
            {activeAssignment && activePos && (
              <div
                className="card p-4 border-l-4 transition-all"
                style={{ borderLeftColor: ASSIGNMENT_COLORS[activeAssignment.role] }}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display font-bold text-lg text-cream">
                    {POSITION_LABELS[activePos]}
                  </span>
                  <span
                    className="text-xs font-display font-bold uppercase tracking-wide px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: ASSIGNMENT_COLORS[activeAssignment.role] + "33",
                      color: ASSIGNMENT_COLORS[activeAssignment.role],
                    }}
                  >
                    {ASSIGNMENT_LABELS[activeAssignment.role]}
                  </span>
                </div>
                <p className="text-cream/80 text-sm">{activeAssignment.detail}</p>
              </div>
            )}

            {/* All assignments list */}
            {situation && !activePos && (
              <div className="card p-4">
                <p className="section-label mb-3">All assignments</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.entries(situation) as [Position, (typeof situation)[Position]][]).map(
                    ([pos, assignment]) => (
                      <button
                        key={pos}
                        onClick={() => setActivePos(pos)}
                        className="text-left p-2 rounded-lg border border-white/10 hover:border-white/25
                                   bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: ASSIGNMENT_COLORS[assignment.role] }}
                          />
                          <span className="font-display font-bold text-sm text-cream">
                            {POSITION_LABELS[pos]}
                          </span>
                        </div>
                        <p className="text-xs text-cream/50 leading-tight line-clamp-2">
                          {assignment.detail}
                        </p>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
