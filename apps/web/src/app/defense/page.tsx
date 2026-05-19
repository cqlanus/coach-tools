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

export default function DefensePage() {
  const [baseState, setBaseState] = useState<BaseState>("000");
  const [playType,  setPlayType]  = useState<PlayType>("gb_ss");
  const [activePos, setActivePos] = useState<Position | null>(null);

  const situation = getSituation(baseState, playType);

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
