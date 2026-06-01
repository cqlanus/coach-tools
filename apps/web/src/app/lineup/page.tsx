"use client";

import { useState } from "react";
import { TopNav } from "@/components/ui/TopNav";
import { generateLineup, DISPLAY_POSITIONS, FIELD_POSITIONS } from "@/lib/lineup-engine";
import type { Player, LineupInput, LineupResult, OutfieldFormat } from "@/lib/lineup-engine";

type LockRow = { pos: string; player: string };

type Step = "setup" | "assignments" | "result";
type ResultView = "by-position" | "by-player";

const TODAY = new Date().toISOString().slice(0, 10);

function posClass(pos: string): string {
  if (pos === "P") return "text-red font-bold";
  if (pos === "C") return "text-green-400 font-bold";
  if (pos === "BENCH") return "text-cream/40 italic";
  return "text-cream";
}

function dispName(name: string, roster: Player[]): string {
  const p = roster.find(r => r.name.trim() === name);
  return p?.number?.trim() ? `${name} #${p.number.trim()}` : name;
}

export default function LineupPage() {
  const [step, setStep] = useState<Step>("setup");

  // Setup
  const [teamName, setTeamName] = useState("");
  const [gameDate, setGameDate] = useState(TODAY);
  const [innings, setInnings] = useState(6);
  const [outfieldFormat, setOutfieldFormat] = useState<OutfieldFormat>("standard");
  const [roster, setRoster] = useState<Player[]>([
    { name: "", number: "" },
    { name: "", number: "" },
    { name: "", number: "" },
  ]);

  // Assignments
  const [pitchers, setPitchers] = useState<string[]>(Array(6).fill(""));
  const [catchers, setCatchers] = useState<string[]>(Array(6).fill(""));
  const [lockedFields, setLockedFields] = useState<LockRow[][]>(
    Array.from({ length: 6 }, () => [])
  );

  // Result
  const [result, setResult] = useState<LineupResult | null>(null);
  const [resultView, setResultView] = useState<ResultView>("by-position");
  const [downloading, setDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const validPlayers = roster.filter(p => p.name.trim() !== "");
  const playerNames = validPlayers.map(p => p.name.trim());

  function addPlayer() {
    setRoster(r => [...r, { name: "", number: "" }]);
  }

  function removePlayer(idx: number) {
    setRoster(r => r.filter((_, i) => i !== idx));
  }

  function updatePlayer(idx: number, field: keyof Player, value: string) {
    setRoster(r => r.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }

  function movePlayer(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= roster.length) return;
    setRoster(r => {
      const arr = [...r];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  }

  function addLockRow(inningIdx: number) {
    setLockedFields(prev => prev.map((rows, i) => i === inningIdx ? [...rows, { pos: "", player: "" }] : rows));
  }

  function removeLockRow(inningIdx: number, rowIdx: number) {
    setLockedFields(prev => prev.map((rows, i) => i === inningIdx ? rows.filter((_, j) => j !== rowIdx) : rows));
  }

  function updateLockRow(inningIdx: number, rowIdx: number, field: keyof LockRow, value: string) {
    setLockedFields(prev => prev.map((rows, i) => {
      if (i !== inningIdx) return rows;
      return rows.map((row, j) => j !== rowIdx ? row : { ...row, [field]: value });
    }));
  }

  function goToAssignments() {
    setPitchers(prev => {
      const next = Array(innings).fill("");
      prev.forEach((v, i) => { if (i < innings) next[i] = v; });
      return next;
    });
    setCatchers(prev => {
      const next = Array(innings).fill("");
      prev.forEach((v, i) => { if (i < innings) next[i] = v; });
      return next;
    });
    setLockedFields(prev => Array.from({ length: innings }, (_, i) => prev[i] ?? []));
    setStep("assignments");
  }

  const inningConflicts = pitchers.slice(0, innings).map((p, i) =>
    p && catchers[i] && p === catchers[i] ? i : null
  ).filter((x): x is number => x !== null);

  const fieldLockConflicts: string[][] = lockedFields.slice(0, innings).map((rows, i) => {
    const errors: string[] = [];
    const pitcher = pitchers[i];
    const catcher = catchers[i];
    const seenPlayers = new Set<string>();
    rows.forEach(({ pos, player }) => {
      if (!pos || !player) return;
      if (player === pitcher) errors.push(`${player} is also pitching inn ${i + 1}`);
      if (player === catcher) errors.push(`${player} is also catching inn ${i + 1}`);
      if (seenPlayers.has(player)) errors.push(`${player} locked to multiple positions inn ${i + 1}`);
      seenPlayers.add(player);
    });
    return errors;
  });
  const hasFieldLockConflicts = fieldLockConflicts.some(errs => errs.length > 0);

  const allAssigned = pitchers.slice(0, innings).every(p => p) &&
    catchers.slice(0, innings).every(c => c);

  function generate() {
    const input: LineupInput = {
      date: gameDate,
      teamName: teamName.trim() || "Team",
      innings,
      battingOrder: validPlayers.map(p => ({
        name: p.name.trim(),
        number: p.number?.trim() || undefined,
      })),
      pitchers: pitchers.slice(0, innings),
      catchers: catchers.slice(0, innings),
      outfieldFormat,
      lockedFieldPositions: lockedFields.slice(0, innings).map(rows =>
        Object.fromEntries(rows.filter(r => r.pos && r.player).map(r => [r.pos, r.player]))
      ),
    };
    const res = generateLineup(input);
    setResult(res);
    setDownloadUrl(null);
    setDownloadError(null);
    setStep("result");
  }

  async function downloadDocx() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch("/api/lineup/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: gameDate,
          team_name: teamName.trim() || "Team",
          innings,
          batting_order: validPlayers.map(p => ({
            name: p.name.trim(),
            number: p.number?.trim() || null,
          })),
          pitchers: pitchers.slice(0, innings),
          catchers: catchers.slice(0, innings),
          outfield_format: outfieldFormat,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Export failed");
      }
      const data = await res.json();
      setDownloadUrl(data.docx_url);
    } catch (e: unknown) {
      setDownloadError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDownloading(false);
    }
  }

  const use4OF = outfieldFormat === "4-outfielder";
  const use8P = validPlayers.length === 8 && !use4OF;
  const posKey = use4OF ? "4-outfielder" : use8P ? "8p" : "standard";
  const displayPositions = DISPLAY_POSITIONS[posKey];
  const benchPerInning = Math.max(0, validPlayers.length - (use4OF ? 10 : use8P ? 8 : 9));
  const hasBench = benchPerInning > 0;

  const inputCls = `w-full bg-navy-light/40 border border-white/15 text-cream text-sm
    rounded-lg px-3 py-2 focus:outline-none focus:border-red/60`;
  const selectCls = `w-full bg-navy-light/40 border border-white/15 text-cream text-sm
    rounded-lg px-3 py-2 focus:outline-none focus:border-red/60 appearance-none`;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-6">

        <div>
          <p className="section-label mb-1">Tool</p>
          <h1 className="font-display font-extrabold text-2xl text-cream">
            Game Day Lineup Generator
          </h1>
          <p className="text-cream/50 text-sm mt-1">
            Enter your roster, pitchers, and catchers to get a full position rotation with minimal repeats.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs">
          {(["setup", "assignments", "result"] as Step[]).map((s, i) => {
            const labels = ["Roster", "Positions", "Rotation"];
            const active = step === s;
            const done = (step === "assignments" && s === "setup") || step === "result";
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <span className="text-white/20">›</span>}
                <span className={`font-display font-semibold px-2 py-0.5 rounded transition-colors ${
                  active ? "bg-red/80 text-cream" : done ? "text-cream/60" : "text-cream/30"
                }`}>
                  {labels[i]}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: ROSTER ── */}
        {step === "setup" && (
          <div className="card p-5 flex flex-col gap-5">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="section-label mb-2">Game Date</p>
                <input type="date" value={gameDate} onChange={e => setGameDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <p className="section-label mb-2">Team Name</p>
                <input
                  type="text" placeholder="Optional" value={teamName}
                  onChange={e => setTeamName(e.target.value)} className={inputCls}
                />
              </div>
            </div>

            <div>
              <p className="section-label mb-2">Innings</p>
              <div className="flex gap-2">
                {[4, 5, 6].map(n => (
                  <button key={n} onClick={() => setInnings(n)}
                    className={`flex-1 py-2 rounded-lg font-display font-bold text-sm border transition-colors
                      ${innings === n
                        ? "bg-red border-red text-cream"
                        : "bg-white/5 border-white/10 text-cream/50 hover:text-cream hover:border-white/25"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="section-label mb-2">Outfield Format</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {(["standard", "4-outfielder"] as OutfieldFormat[]).map(fmt => (
                  <button key={fmt} onClick={() => setOutfieldFormat(fmt)}
                    className={`flex-1 py-2 px-3 rounded-lg font-sans text-sm text-left border transition-colors
                      ${outfieldFormat === fmt
                        ? "bg-navy-light border-red/50 text-cream"
                        : "bg-white/5 border-white/10 text-cream/50 hover:text-cream hover:border-white/25"}`}>
                    {fmt === "standard" ? "3 Outfielders — LF · CF · RF" : "4 Outfielders — LF · LC · RC · RF"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-2">
                <p className="section-label">Batting Order</p>
                <span className="text-cream/30 text-xs">{validPlayers.length} player{validPlayers.length !== 1 ? "s" : ""}</span>
              </div>
              <p className="text-cream/40 text-xs mb-3">
                Enter players top-to-bottom in batting order. Jersey number is optional.
              </p>
              <div className="flex flex-col gap-2">
                {roster.map((player, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-cream/30 font-display font-bold text-sm w-5 shrink-0 text-right">
                      {idx + 1}
                    </span>
                    <input
                      type="text" placeholder="Player name" value={player.name}
                      onChange={e => updatePlayer(idx, "name", e.target.value)}
                      className="flex-1 bg-navy-light/40 border border-white/15 text-cream text-sm
                        rounded-lg px-3 py-1.5 focus:outline-none focus:border-red/60"
                    />
                    <input
                      type="text" placeholder="#" value={player.number ?? ""}
                      onChange={e => updatePlayer(idx, "number", e.target.value)}
                      className="w-12 bg-navy-light/40 border border-white/15 text-cream text-sm
                        rounded-lg px-2 py-1.5 focus:outline-none focus:border-red/60 text-center"
                    />
                    <button
                      onClick={() => movePlayer(idx, -1)} disabled={idx === 0}
                      className="text-cream/30 hover:text-cream disabled:opacity-20 px-1 text-xs"
                    >↑</button>
                    <button
                      onClick={() => movePlayer(idx, 1)} disabled={idx === roster.length - 1}
                      className="text-cream/30 hover:text-cream disabled:opacity-20 px-1 text-xs"
                    >↓</button>
                    <button
                      onClick={() => removePlayer(idx)}
                      className="text-cream/30 hover:text-red-light px-1 text-sm"
                    >×</button>
                  </div>
                ))}
              </div>
              <button onClick={addPlayer}
                className="mt-3 text-cream/50 hover:text-cream text-sm font-display font-semibold transition-colors">
                + Add Player
              </button>
            </div>

            {validPlayers.length > 0 && (
              <div className="text-xs text-cream/40 border-t border-white/10 pt-3">
                {validPlayers.length} players · {use4OF ? 10 : use8P ? 8 : 9} positions ·{" "}
                {hasBench
                  ? `${benchPerInning} player${benchPerInning > 1 ? "s" : ""} bench per inning`
                  : "no bench"}
              </div>
            )}

            <button
              onClick={goToAssignments}
              disabled={validPlayers.length < 8}
              className="btn-primary w-full mt-1"
            >
              {validPlayers.length < 8
                ? `Need ${8 - validPlayers.length} more player${8 - validPlayers.length !== 1 ? "s" : ""} (min 8)`
                : "Next: Assign Positions →"}
            </button>
          </div>
        )}

        {/* ── STEP 2: POSITION ASSIGNMENTS ── */}
        {step === "assignments" && (
          <>
            <div className="card p-5 flex flex-col gap-5">
              {Array.from({ length: innings }, (_, i) => (
                <div key={i}>
                  <p className="section-label mb-2">Inning {i + 1}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-cream/50 text-xs mb-1">Pitcher</p>
                      <select
                        value={pitchers[i] ?? ""}
                        onChange={e => setPitchers(prev => {
                          const next = [...prev];
                          next[i] = e.target.value;
                          return next;
                        })}
                        className={selectCls}
                      >
                        <option value="">— select —</option>
                        {playerNames.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-cream/50 text-xs mb-1">Catcher</p>
                      <select
                        value={catchers[i] ?? ""}
                        onChange={e => setCatchers(prev => {
                          const next = [...prev];
                          next[i] = e.target.value;
                          return next;
                        })}
                        className={selectCls}
                      >
                        <option value="">— select —</option>
                        {playerNames.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                  {inningConflicts.includes(i) && (
                    <p className="text-red-light text-xs mt-1">
                      ⚠ Same player for pitcher and catcher — change one before generating.
                    </p>
                  )}

                  {/* Field position locks */}
                  {lockedFields[i].length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {lockedFields[i].map((row, rowIdx) => {
                        const lockedPosInInning = new Set(
                          lockedFields[i].filter((_, j) => j !== rowIdx).map(r => r.pos).filter(Boolean)
                        );
                        const unavailablePlayers = new Set([
                          pitchers[i],
                          catchers[i],
                          ...lockedFields[i].filter((_, j) => j !== rowIdx).map(r => r.player).filter(Boolean),
                        ]);
                        return (
                          <div key={rowIdx} className="flex items-center gap-2">
                            <select
                              value={row.pos}
                              onChange={e => updateLockRow(i, rowIdx, "pos", e.target.value)}
                              className={`flex-1 ${selectCls}`}
                            >
                              <option value="">— position —</option>
                              {FIELD_POSITIONS[posKey]
                                .filter(p => !lockedPosInInning.has(p) || p === row.pos)
                                .map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <select
                              value={row.player}
                              onChange={e => updateLockRow(i, rowIdx, "player", e.target.value)}
                              className={`flex-1 ${selectCls}`}
                            >
                              <option value="">— player —</option>
                              {playerNames
                                .filter(n => !unavailablePlayers.has(n) || n === row.player)
                                .map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <button
                              onClick={() => removeLockRow(i, rowIdx)}
                              className="text-cream/30 hover:text-red-light px-1 text-sm"
                            >×</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <button
                    onClick={() => addLockRow(i)}
                    className="mt-2 text-cream/40 hover:text-cream text-xs font-display font-semibold transition-colors"
                  >
                    + Lock a position
                  </button>
                  {fieldLockConflicts[i]?.map((err, j) => (
                    <p key={j} className="text-red-light text-xs mt-1">⚠ {err}</p>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("setup")} className="btn-secondary flex-1">
                ← Back
              </button>
              <button
                onClick={generate}
                disabled={!allAssigned || inningConflicts.length > 0 || hasFieldLockConflicts}
                className="btn-primary flex-1"
              >
                Generate Rotation
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: RESULT ── */}
        {step === "result" && result && (
          <>
            {result.conflictErrors.length > 0 && (
              <div className="card p-4 border-red/40">
                {result.conflictErrors.map((e, i) => (
                  <p key={i} className="text-red-light text-sm">{e}</p>
                ))}
              </div>
            )}

            {result.assignments.length > 0 && (
              <div className="card p-5 flex flex-col gap-4">
                {/* Summary row */}
                <div className="flex items-center gap-6 pb-3 border-b border-white/10">
                  <div>
                    <p className="section-label mb-0.5">Players</p>
                    <p className="font-display font-bold text-xl text-cream">{validPlayers.length}</p>
                  </div>
                  <div>
                    <p className="section-label mb-0.5">Innings</p>
                    <p className="font-display font-bold text-xl text-cream">{innings}</p>
                  </div>
                  <div>
                    <p className="section-label mb-0.5">Repeats</p>
                    <p className={`font-display font-bold text-xl ${result.repeats === 0 ? "text-green-400" : "text-cream/60"}`}>
                      {result.repeats}
                    </p>
                  </div>
                  {hasBench && (
                    <div>
                      <p className="section-label mb-0.5">Bench / Inn</p>
                      <p className="font-display font-bold text-xl text-cream">{benchPerInning}</p>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-red font-bold">P = Pitcher</span>
                  <span className="text-green-400 font-bold">C = Catcher</span>
                  {hasBench && <span className="text-cream/40 italic">BENCH = Sitting out</span>}
                </div>

                {/* View toggle */}
                <div className="flex gap-2">
                  {(["by-position", "by-player"] as ResultView[]).map(v => (
                    <button key={v} onClick={() => setResultView(v)}
                      className={`px-3 py-1.5 rounded-lg font-display font-semibold text-sm border transition-colors
                        ${resultView === v
                          ? "bg-red border-red text-cream"
                          : "bg-white/5 border-white/10 text-cream/50 hover:text-cream"}`}>
                      {v === "by-position" ? "By Position" : "By Player"}
                    </button>
                  ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto -mx-1">
                  {resultView === "by-position" ? (
                    <table className="w-full text-xs border-collapse min-w-max">
                      <thead>
                        <tr className="bg-navy-dark/60">
                          <th className="text-left px-3 py-2 text-cream/50 font-display font-semibold">Position</th>
                          {result.assignments.map(a => (
                            <th key={a.inning} className="px-3 py-2 text-cream/50 font-display font-semibold text-center">
                              Inn {a.inning}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...displayPositions, ...(hasBench ? ["BENCH"] : [])].map((pos, rowIdx) => (
                          <tr key={pos} className={rowIdx % 2 === 0 ? "bg-white/5" : ""}>
                            <td className="px-3 py-2 font-display font-semibold text-cream/60">{pos}</td>
                            {result.assignments.map(a => {
                              let cell = "";
                              if (pos === "P") cell = dispName(a.pitcher, validPlayers);
                              else if (pos === "C") cell = dispName(a.catcher, validPlayers);
                              else if (pos === "BENCH") cell = a.bench.map(b => dispName(b, validPlayers)).join(", ");
                              else cell = a.field[pos] ? dispName(a.field[pos], validPlayers) : "—";
                              return (
                                <td key={a.inning} className={`px-3 py-2 text-center ${posClass(pos)}`}>
                                  {cell || "—"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-xs border-collapse min-w-max">
                      <thead>
                        <tr className="bg-navy-dark/60">
                          <th className="text-left px-2 py-2 text-cream/50 font-display font-semibold w-6">#</th>
                          <th className="text-left px-3 py-2 text-cream/50 font-display font-semibold">Player</th>
                          {result.assignments.map(a => (
                            <th key={a.inning} className="px-3 py-2 text-cream/50 font-display font-semibold text-center">
                              Inn {a.inning}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {validPlayers.map((player, rowIdx) => {
                          const positions = result.positionTotals[player.name] ?? [];
                          return (
                            <tr key={player.name} className={rowIdx % 2 === 0 ? "bg-white/5" : ""}>
                              <td className="px-2 py-2 text-cream/30 text-center">{rowIdx + 1}</td>
                              <td className="px-3 py-2 text-cream font-semibold">
                                {dispName(player.name, validPlayers)}
                              </td>
                              {positions.map((pos, i) => (
                                <td key={i} className={`px-3 py-2 text-center ${posClass(pos)}`}>{pos}</td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Download */}
                {downloadError && (
                  <p className="text-red-light text-xs">{downloadError}</p>
                )}
                <div className="flex gap-3 pt-1">
                  {downloadUrl ? (
                    <a href={downloadUrl} download className="btn-primary flex-1 text-center text-sm">
                      ↓ Download .docx
                    </a>
                  ) : (
                    <button onClick={downloadDocx} disabled={downloading} className="btn-primary flex-1 text-sm">
                      {downloading ? "Preparing…" : "↓ Export .docx"}
                    </button>
                  )}
                </div>
              </div>
            )}

            <button onClick={() => setStep("assignments")} className="btn-secondary text-sm self-start">
              ← Back to Assignments
            </button>
          </>
        )}

      </main>
    </div>
  );
}
