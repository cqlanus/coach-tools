"use client";

import { useState } from "react";
import { TopNav } from "@/components/ui/TopNav";
import type { Metadata } from "next";

type Duration = 60 | 90 | 120;
type Location = "field" | "overtime" | "gym";
type Coaches  = 2 | 3 | 4;
type Focus =
  | "balanced" | "throwing" | "hitting" | "fielding"
  | "baserunning" | "situations" | "pitching" | "catching";

interface PhaseSummary {
  key: string;
  label: string;
  minutes: number;
}

interface GenerateResponse {
  docx_url?: string;
  xlsx_url?: string;
  summary: {
    date: string;
    duration: number;
    location: string;
    focus: string;
    total_minutes: number;
    phases: PhaseSummary[];
    equipment: string[];
  };
}

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

export default function PracticePage() {
  const [duration,     setDuration]     = useState<Duration>(90);
  const [location,     setLocation]     = useState<Location>("field");
  const [coaches,      setCoaches]      = useState<Coaches>(3);
  const [focus,        setFocus]        = useState<Focus>("balanced");
  const [playerCount,  setPlayerCount]  = useState(12);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [result,       setResult]       = useState<GenerateResponse | null>(null);

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

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        <div>
          <p className="section-label mb-1">Tool</p>
          <h1 className="font-display font-extrabold text-2xl text-cream">
            Practice Plan Generator
          </h1>
          <p className="text-cream/50 text-sm mt-1">
            Configure your practice and download a timed plan as Word doc or spreadsheet.
          </p>
        </div>

        {/* Config form */}
        <div className="card p-5 flex flex-col gap-5">

          {/* Duration */}
          <div>
            <p className="section-label mb-2">Duration</p>
            <div className="flex gap-2">
              {([60, 90, 120] as Duration[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-lg font-display font-bold text-sm transition-colors border
                    ${duration === d
                      ? "bg-red border-red text-cream"
                      : "bg-white/5 border-white/10 text-cream/50 hover:border-white/25 hover:text-cream"}`}
                >
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
                <button
                  key={k}
                  onClick={() => setLocation(k)}
                  className={`py-2 px-3 rounded-lg font-sans text-sm text-left transition-colors border
                    ${location === k
                      ? "bg-navy-light border-red/50 text-cream"
                      : "bg-white/5 border-white/10 text-cream/50 hover:border-white/25 hover:text-cream"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Coaches + players */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="section-label mb-2">Coaches</p>
              <div className="flex gap-2">
                {([2, 3, 4] as Coaches[]).map((n) => (
                  <button
                    key={n}
                    onClick={() => setCoaches(n)}
                    className={`flex-1 py-2 rounded-lg font-display font-bold text-sm border transition-colors
                      ${coaches === n
                        ? "bg-red border-red text-cream"
                        : "bg-white/5 border-white/10 text-cream/50 hover:text-cream"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="section-label mb-2">Players</p>
              <input
                type="number"
                min={8} max={15} value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
                className="w-full bg-navy-light/40 border border-white/15 text-cream text-sm
                           rounded-lg px-3 py-2 focus:outline-none focus:border-red/60"
              />
            </div>
          </div>

          {/* Focus */}
          <div>
            <p className="section-label mb-2">Focus</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.entries(FOCUSES) as [Focus, string][]).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setFocus(k)}
                  className={`py-2 px-3 rounded-lg font-sans text-xs text-left border transition-colors
                    ${focus === k
                      ? "bg-navy-light border-red/50 text-cream"
                      : "bg-white/5 border-white/10 text-cream/50 hover:border-white/25 hover:text-cream"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="btn-primary w-full mt-1"
          >
            {loading ? "Generating…" : "Generate Practice Plan"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="card p-4 border-red/40 text-red-light text-sm">
            {error}
          </div>
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

            {/* Phase timeline */}
            <div className="flex flex-col gap-2">
              {result.summary.phases.map((phase) => (
                <div key={phase.key} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: PHASE_COLORS[phase.key] ?? "#374151" }}
                  />
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
                  {result.summary.equipment
                    .map((e) => e.replace(/_/g, " "))
                    .join("  ·  ")}
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
      </main>
    </div>
  );
}
