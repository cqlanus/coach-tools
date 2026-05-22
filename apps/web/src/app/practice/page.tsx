"use client";

import { useState, useEffect, useMemo } from "react";
import { TopNav } from "@/components/ui/TopNav";

// ── Types ──────────────────────────────────────────────────────────────────

interface Drill {
  id: string;
  name: string;
  category: string;
  station_role: string;
  focus_tags: string[];
  description: string;
  coaching_cues: string[];
  duration_min: number;
  duration_max: number;
  equipment: string[];
  level: string;
  locations: string[];
  coaches_needed: number;
  self_directed: boolean;
  station_safe: boolean;
  skills: string[];
}

interface PhaseSummary {
  key: string;
  label: string;
  minutes: number;
}

interface GenerateSummary {
  date: string;
  duration: number;
  location: string;
  focus: string;
  total_minutes: number;
  phases: PhaseSummary[];
  equipment: string[];
  pinned_placed: string[];
  pinned_total: number;
}

interface GenerateResponse {
  docx_url?: string;
  xlsx_url?: string;
  summary: GenerateSummary;
}

// ── Constants ──────────────────────────────────────────────────────────────

type Duration = 60 | 90 | 120;
type Location = "field" | "overtime" | "gym";
type Coaches  = 2 | 3 | 4;
type Focus    =
  | "balanced" | "throwing" | "hitting" | "fielding"
  | "baserunning" | "situations" | "pitching" | "catching";

type Tab = "configure" | "library";

const LOCATIONS: Record<Location, string> = {
  field:    "On the Field",
  overtime: "Overtime Sports",
  gym:      "LTHS Gym",
};

const FOCUSES: Record<Focus, string> = {
  balanced:    "Balanced",
  throwing:    "Throwing & Arm",
  hitting:     "Hitting",
  fielding:    "Fielding",
  baserunning: "Base Running",
  situations:  "Situations",
  pitching:    "Pitching",
  catching:    "Catching",
};

const PHASE_COLORS: Record<string, string> = {
  opening:  "#2E5FA3",
  stations: "#166534",
  team:     "#92400e",
  closure:  "#374151",
};

const ROLE_LABELS: Record<string, string> = {
  opening:           "Opening",
  station_hitting:   "Hitting Station",
  station_fielding:  "Fielding Station",
  station_pitching:  "Pitching Station",
  station_catching:  "Catching Station",
  station_throwing:  "Throwing Station",
  team:              "Team Time",
  closure:           "Closure",
};

const ROLE_COLORS: Record<string, string> = {
  opening:           "bg-blue-900/50 text-blue-300",
  station_hitting:   "bg-amber-900/50 text-amber-300",
  station_fielding:  "bg-green-900/50 text-green-300",
  station_pitching:  "bg-purple-900/50 text-purple-300",
  station_catching:  "bg-teal-900/50 text-teal-300",
  station_throwing:  "bg-orange-900/50 text-orange-300",
  team:              "bg-red-900/50 text-red-300",
  closure:           "bg-gray-800/50 text-gray-400",
};

const FILTER_FOCUSES = [
  { value: "", label: "Any Focus" },
  { value: "balanced",    label: "Balanced" },
  { value: "throwing",    label: "Throwing" },
  { value: "hitting",     label: "Hitting" },
  { value: "fielding",    label: "Fielding" },
  { value: "baserunning", label: "Base Running" },
  { value: "situations",  label: "Situations" },
  { value: "pitching",    label: "Pitching" },
  { value: "catching",    label: "Catching" },
];

const FILTER_ROLES = [
  { value: "",                  label: "Any Type" },
  { value: "opening",           label: "Opening" },
  { value: "station_hitting",   label: "Hitting Station" },
  { value: "station_fielding",  label: "Fielding Station" },
  { value: "station_pitching",  label: "Pitching Station" },
  { value: "station_catching",  label: "Catching Station" },
  { value: "station_throwing",  label: "Throwing Station" },
  { value: "team",              label: "Team Time" },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function PracticePage() {
  const [tab, setTab] = useState<Tab>("configure");

  // Configure form
  const [duration,    setDuration]    = useState<Duration>(90);
  const [location,    setLocation]    = useState<Location>("field");
  const [coaches,     setCoaches]     = useState<Coaches>(3);
  const [focus,       setFocus]       = useState<Focus>("balanced");
  const [playerCount, setPlayerCount] = useState(12);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [result,      setResult]      = useState<GenerateResponse | null>(null);

  // Drill library
  const [drills,        setDrills]        = useState<Drill[]>([]);
  const [drillsLoading, setDrillsLoading] = useState(false);
  const [pinnedIds,     setPinnedIds]     = useState<Set<string>>(new Set());
  const [search,        setSearch]        = useState("");
  const [filterFocus,   setFilterFocus]   = useState("");
  const [filterRole,    setFilterRole]    = useState("");
  const [filterLoc,     setFilterLoc]     = useState("");
  const [filterLevel,   setFilterLevel]   = useState("");
  const [expanded,      setExpanded]      = useState<string | null>(null);

  // Load drill library once
  useEffect(() => {
    setDrillsLoading(true);
    fetch("/api/practice-plan/drills")
      .then(r => r.json())
      .then(d => setDrills(d.drills ?? []))
      .catch(() => {})
      .finally(() => setDrillsLoading(false));
  }, []);

  const pinnedDrills = useMemo(
    () => drills.filter(d => pinnedIds.has(d.id)),
    [drills, pinnedIds]
  );

  const filteredDrills = useMemo(() => {
    const q = search.toLowerCase();
    return drills.filter(d => {
      if (q && !d.name.toLowerCase().includes(q) &&
          !d.description?.toLowerCase().includes(q)) return false;
      if (filterFocus && !d.focus_tags?.includes(filterFocus)) return false;
      if (filterRole  && d.station_role !== filterRole) return false;
      if (filterLoc   && !d.locations?.includes(filterLoc)) return false;
      if (filterLevel && d.level !== filterLevel) return false;
      return true;
    });
  }, [drills, search, filterFocus, filterRole, filterLoc, filterLevel]);

  function togglePin(id: string) {
    setPinnedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/practice-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration, location, coaches, focus,
          player_count: playerCount,
          format: "both",
          pinned_drill_ids: Array.from(pinnedIds),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Generation failed");
      }
      setResult(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = `w-full bg-navy-light/40 border border-white/15 text-cream text-sm
    rounded-lg px-3 py-2 focus:outline-none focus:border-red/60`;
  const selectCls = `bg-navy-light/40 border border-white/15 text-cream text-sm
    rounded-lg px-3 py-2 focus:outline-none focus:border-red/60 appearance-none`;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-6">

        {/* Header */}
        <div>
          <p className="section-label mb-1">Tool</p>
          <h1 className="font-display font-extrabold text-2xl text-cream">
            Practice Plan Generator
          </h1>
          <p className="text-cream/50 text-sm mt-1">
            Configure your practice, browse and reserve specific drills, then generate a timed plan.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-white/10 pb-0">
          {(["configure", "library"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-2 font-display font-semibold text-sm transition-colors rounded-t-lg
                ${tab === t
                  ? "text-cream bg-navy-light/30 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red"
                  : "text-cream/40 hover:text-cream/70"}`}
            >
              {t === "configure" ? "Configure" : "Drill Library"}
              {t === "library" && drills.length > 0 && (
                <span className="ml-1.5 text-xs text-cream/30">{drills.length}</span>
              )}
              {t === "configure" && pinnedIds.size > 0 && (
                <span className="ml-1.5 text-xs bg-red/70 text-cream px-1.5 py-0.5 rounded-full">
                  {pinnedIds.size}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── CONFIGURE TAB ────────────────────────────────────────────── */}
        {tab === "configure" && (
          <>
            <div className="card p-5 flex flex-col gap-5">

              {/* Duration */}
              <div>
                <p className="section-label mb-2">Duration</p>
                <div className="flex gap-2">
                  {([60, 90, 120] as Duration[]).map(d => (
                    <button key={d} onClick={() => setDuration(d)}
                      className={`flex-1 py-2 rounded-lg font-display font-bold text-sm border transition-colors
                        ${duration === d
                          ? "bg-red border-red text-cream"
                          : "bg-white/5 border-white/10 text-cream/50 hover:border-white/25 hover:text-cream"}`}>
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="section-label mb-2">Location</p>
                <div className="flex flex-col gap-2">
                  {(Object.entries(LOCATIONS) as [Location, string][]).map(([k, v]) => (
                    <button key={k} onClick={() => setLocation(k)}
                      className={`py-2 px-3 rounded-lg font-sans text-sm text-left border transition-colors
                        ${location === k
                          ? "bg-navy-light border-red/50 text-cream"
                          : "bg-white/5 border-white/10 text-cream/50 hover:border-white/25 hover:text-cream"}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coaches + Players */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="section-label mb-2">Coaches</p>
                  <div className="flex gap-2">
                    {([2, 3, 4] as Coaches[]).map(n => (
                      <button key={n} onClick={() => setCoaches(n)}
                        className={`flex-1 py-2 rounded-lg font-display font-bold text-sm border transition-colors
                          ${coaches === n
                            ? "bg-red border-red text-cream"
                            : "bg-white/5 border-white/10 text-cream/50 hover:text-cream"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="section-label mb-2">Players</p>
                  <input type="number" min={8} max={15} value={playerCount}
                    onChange={e => setPlayerCount(Number(e.target.value))}
                    className={inputCls} />
                </div>
              </div>

              {/* Focus */}
              <div>
                <p className="section-label mb-2">Focus</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.entries(FOCUSES) as [Focus, string][]).map(([k, v]) => (
                    <button key={k} onClick={() => setFocus(k)}
                      className={`py-2 px-3 rounded-lg font-sans text-xs text-left border transition-colors
                        ${focus === k
                          ? "bg-navy-light border-red/50 text-cream"
                          : "bg-white/5 border-white/10 text-cream/50 hover:border-white/25 hover:text-cream"}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generate} disabled={loading} className="btn-primary w-full mt-1">
                {loading ? "Generating…" : "Generate Practice Plan"}
              </button>
            </div>

            {/* Pinned drills section */}
            {pinnedDrills.length > 0 ? (
              <div className="card p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="section-label">Reserved Drills</p>
                  <span className="text-cream/40 text-xs">{pinnedDrills.length} drill{pinnedDrills.length !== 1 ? "s" : ""} reserved</span>
                </div>
                <p className="text-cream/40 text-xs -mt-1">
                  These drills will be placed first when the plan is generated.
                </p>
                <div className="flex flex-col gap-2">
                  {pinnedDrills.map(d => (
                    <div key={d.id}
                      className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                      <span className={`text-xs font-display font-semibold px-2 py-0.5 rounded shrink-0
                        ${ROLE_COLORS[d.station_role] ?? "bg-gray-800 text-gray-400"}`}>
                        {ROLE_LABELS[d.station_role] ?? d.station_role}
                      </span>
                      <span className="text-cream text-sm flex-1 truncate">{d.name}</span>
                      <button onClick={() => togglePin(d.id)}
                        className="text-cream/30 hover:text-red-light text-sm shrink-0 px-1">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setTab("library")}
                  className="text-cream/40 hover:text-cream text-xs text-left transition-colors">
                  + Browse library to add more →
                </button>
              </div>
            ) : (
              <button onClick={() => setTab("library")}
                className="card p-4 text-left hover:border-white/25 transition-colors group">
                <p className="text-cream/50 text-sm group-hover:text-cream/70 transition-colors">
                  Browse the drill library to reserve specific drills for this practice →
                </p>
              </button>
            )}

            {/* Error */}
            {error && (
              <div className="card p-4 border-red/40 text-red-light text-sm">{error}</div>
            )}

            {/* Result */}
            {result && (
              <div className="card p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="section-label">Plan ready</p>
                  <span className="text-cream/40 text-xs">
                    {result.summary.total_minutes} / {result.summary.duration} min
                  </span>
                </div>

                {/* Pinned confirmation */}
                {result.summary.pinned_total > 0 && (
                  <div className="flex items-start gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-green-400 text-sm shrink-0">✓</span>
                    <p className="text-cream/70 text-xs leading-relaxed">
                      {result.summary.pinned_placed.length === result.summary.pinned_total
                        ? `All ${result.summary.pinned_total} reserved drill${result.summary.pinned_total !== 1 ? "s" : ""} included`
                        : `${result.summary.pinned_placed.length} of ${result.summary.pinned_total} reserved drills included`}
                      {result.summary.pinned_placed.length > 0 && (
                        <span className="text-cream/40">
                          {" — "}{result.summary.pinned_placed.join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Phase timeline */}
                <div className="flex flex-col gap-2">
                  {result.summary.phases.map(phase => (
                    <div key={phase.key} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: PHASE_COLORS[phase.key] ?? "#374151" }} />
                      <span className="text-cream text-sm flex-1">{phase.label}</span>
                      <span className="text-cream/40 text-xs">{phase.minutes} min</span>
                    </div>
                  ))}
                </div>

                {/* Equipment */}
                {result.summary.equipment.length > 0 && (
                  <div>
                    <p className="section-label mb-1">Equipment</p>
                    <p className="text-cream/60 text-xs">
                      {result.summary.equipment.map(e => e.replace(/_/g, " ")).join("  ·  ")}
                    </p>
                  </div>
                )}

                {/* Downloads */}
                <div className="flex gap-3">
                  {result.docx_url && (
                    <a href={result.docx_url} download className="btn-primary flex-1 text-center text-sm">
                      ↓ Word Doc
                    </a>
                  )}
                  {result.xlsx_url && (
                    <a href={result.xlsx_url} download className="btn-secondary flex-1 text-center text-sm">
                      ↓ Spreadsheet
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── LIBRARY TAB ──────────────────────────────────────────────── */}
        {tab === "library" && (
          <>
            {/* Filters */}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Search drills…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <select value={filterFocus} onChange={e => setFilterFocus(e.target.value)}
                  className={selectCls}>
                  {FILTER_FOCUSES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                  className={selectCls}>
                  {FILTER_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <select value={filterLoc} onChange={e => setFilterLoc(e.target.value)}
                  className={selectCls}>
                  <option value="">Any Location</option>
                  <option value="field">Field</option>
                  <option value="overtime">Indoor</option>
                  <option value="gym">Gym</option>
                </select>
                <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
                  className={selectCls}>
                  <option value="">Any Level</option>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                </select>
              </div>

              {/* Active filter summary + clear */}
              <div className="flex items-center justify-between text-xs text-cream/40">
                <span>
                  {filteredDrills.length} of {drills.length} drills
                  {pinnedIds.size > 0 && (
                    <span className="ml-2 text-red-light font-semibold">
                      · {pinnedIds.size} reserved
                    </span>
                  )}
                </span>
                {(search || filterFocus || filterRole || filterLoc || filterLevel) && (
                  <button
                    onClick={() => { setSearch(""); setFilterFocus(""); setFilterRole("");
                      setFilterLoc(""); setFilterLevel(""); }}
                    className="hover:text-cream transition-colors">
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Drill cards */}
            {drillsLoading ? (
              <p className="text-cream/40 text-sm text-center py-8">Loading drills…</p>
            ) : filteredDrills.length === 0 ? (
              <p className="text-cream/40 text-sm text-center py-8">No drills match your filters.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDrills.map(drill => {
                  const pinned = pinnedIds.has(drill.id);
                  const isExpanded = expanded === drill.id;
                  return (
                    <div key={drill.id}
                      className={`card p-4 flex flex-col gap-3 transition-all
                        ${pinned ? "border-red/50 bg-red/5" : "hover:border-white/20"}`}>

                      {/* Role + level badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-display font-semibold px-2 py-0.5 rounded
                          ${ROLE_COLORS[drill.station_role] ?? "bg-gray-800 text-gray-400"}`}>
                          {ROLE_LABELS[drill.station_role] ?? drill.station_role}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-display font-semibold
                          ${drill.level === "intermediate"
                            ? "bg-purple-900/50 text-purple-300"
                            : "bg-gray-800/60 text-gray-400"}`}>
                          {drill.level}
                        </span>
                        {pinned && (
                          <span className="text-xs text-red-light font-display font-semibold ml-auto">
                            ✓ Reserved
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <p className="text-cream font-display font-bold text-sm leading-snug">
                        {drill.name}
                      </p>

                      {/* Meta: duration + location */}
                      <div className="flex items-center gap-3 text-xs text-cream/40">
                        <span>{drill.duration_min}–{drill.duration_max} min</span>
                        <span>·</span>
                        <span>{drill.locations?.map(l =>
                          l === "overtime" ? "Indoor" : l.charAt(0).toUpperCase() + l.slice(1)
                        ).join(" · ")}</span>
                        {drill.coaches_needed > 1 && (
                          <>
                            <span>·</span>
                            <span>{drill.coaches_needed} coaches</span>
                          </>
                        )}
                      </div>

                      {/* Equipment tags */}
                      {drill.equipment?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {drill.equipment.slice(0, 4).map(eq => (
                            <span key={eq}
                              className="text-xs bg-white/5 text-cream/40 px-2 py-0.5 rounded">
                              {eq.replace(/_/g, " ")}
                            </span>
                          ))}
                          {drill.equipment.length > 4 && (
                            <span className="text-xs text-cream/25">
                              +{drill.equipment.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Expandable description */}
                      {isExpanded && (
                        <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
                          <p className="text-cream/60 text-xs leading-relaxed">
                            {drill.description}
                          </p>
                          {drill.coaching_cues?.length > 0 && (
                            <div>
                              <p className="text-cream/40 text-xs mb-1 font-semibold uppercase tracking-wider">Cues</p>
                              <ul className="flex flex-col gap-0.5">
                                {drill.coaching_cues.slice(0, 3).map((cue, i) => (
                                  <li key={i} className="text-xs text-cream/50 flex gap-1.5">
                                    <span className="text-cream/25 shrink-0">•</span>{cue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-auto pt-1">
                        <button
                          onClick={() => setExpanded(isExpanded ? null : drill.id)}
                          className="text-cream/30 hover:text-cream/60 text-xs transition-colors">
                          {isExpanded ? "Less ↑" : "Details ↓"}
                        </button>
                        <button
                          onClick={() => togglePin(drill.id)}
                          className={`ml-auto text-xs font-display font-semibold px-3 py-1.5 rounded-lg border transition-colors
                            ${pinned
                              ? "bg-red/20 border-red/40 text-red-light hover:bg-red/30"
                              : "bg-white/5 border-white/10 text-cream/60 hover:border-white/30 hover:text-cream"}`}>
                          {pinned ? "Remove" : "+ Reserve"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sticky footer when drills are pinned */}
            {pinnedIds.size > 0 && (
              <div className="sticky bottom-4">
                <button
                  onClick={() => setTab("configure")}
                  className="w-full btn-primary shadow-lg">
                  ← Back to Configure ({pinnedIds.size} reserved)
                </button>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
