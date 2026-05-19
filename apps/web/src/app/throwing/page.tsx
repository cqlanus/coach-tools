import type { Metadata } from "next";
import { TopNav } from "@/components/ui/TopNav";

export const metadata: Metadata = { title: "Throwing Program" };

const weeks = [
  { week: 1, jbands: "10 reps", throwing: "Light Catch (60–70%)\n30–40 ft · 6 min\nFocus: Easy, relaxed arm action", delivery: "Mirror Work 5–10 min\nTowel Drill 5 min", longtoss: "OFF" },
  { week: 2, jbands: "11 reps", throwing: "Light Catch (65–75%)\n35–45 ft · 7 min\nFocus: Grip & release", delivery: "Mirror Work 5–10 min\nTowel Drill 5 min", longtoss: "OFF" },
  { week: 3, jbands: "12 reps", throwing: "Catch (70–80%)\n40–50 ft · 8 min\nFocus: Stepping toward target", delivery: "Mirror Work 5–10 min\nTowel Drill 5 min", longtoss: "Long Toss Intro\nStart 30 ft → 50–60 ft\nArc on every throw\nCrow hop when moving back" },
  { week: 4, jbands: "12 reps", throwing: "Catch (75–85%)\n45–55 ft · 9 min\nFocus: Balance & direction", delivery: "Mirror Work 5–10 min\nTowel Drill 5 min", longtoss: "Out: 30 ft → 60–70 ft\nIn: Back down to 45 ft on a line\nFinish: 10 easy throws at 45 ft" },
  { week: 5, jbands: "13 reps", throwing: "Catch (80–85%)\n50–60 ft · 10 min\nFocus: Chest-to-chest target", delivery: "Mirror Work 5–10 min\nTowel Drill 5 min", longtoss: "Out: 30 ft → 65–75 ft\nIn: Pull down to 45 ft on a line\nFinish: 10 easy throws at 45 ft" },
  { week: 6, jbands: "13 reps", throwing: "Catch (80–85%)\n50–60 ft · 10 min\n+ 20 Pitch Bullpen (FB only)", delivery: "Mirror Work 5–10 min\nTowel Drill 5 min", longtoss: "Out: 30 ft → 70–80 ft\nIn: Pull down to 45 ft on a line\nFinish: 10 easy throws at 45 ft" },
  { week: 7, jbands: "14 reps", throwing: "Catch (80–90%)\n55–65 ft · 10 min\n+ 20 Pitch Bullpen (FB only)", delivery: "Mirror Work 5–10 min\nTowel Drill 5 min", longtoss: "Out: 30 ft → 75–85 ft\nIn: Pull down to 45 ft on a line\nFinish: 10 easy throws at 45 ft" },
  { week: 8, jbands: "14 reps", throwing: "Catch (85–90%)\n55–65 ft · 11 min\n+ 25 Pitch Bullpen (FB only)", delivery: "Mirror Work 5–10 min\nTowel Drill 5 min", longtoss: "Out: 30 ft → 80–90 ft\nIn: Pull down to 45 ft on a line\nFinish: 10 easy throws at 45 ft" },
];

const drills = [
  { name: "Mirror Drill", body: "Stand in front of a mirror or window. Go through your full delivery slowly — no ball. Watch your balance point, stride foot direction, and shoulder level. 5–15 minutes, fully indoors, zero arm stress." },
  { name: "Towel Drill", body: "Hold a small towel in your throwing hand (same grip as a fastball). Go through your full delivery and whip the towel toward a target. Builds extension and finish without loading the arm. Focus on snap and follow-through." },
  { name: "Catch Play", body: "Every throw should be made with intention — correct grip, step toward your target, follow through. Before Week 3, use a gentle arc on every throw to build arm strength. After Week 3, crow-hop on any throw past 50 ft." },
  { name: "Long Toss", body: "Arc on the way out (feel extension), throw on a line on the way in. Stop when body control starts to break down — never push past that point. Max for 8U is ~80–90 ft." },
];

export default function ThrowingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-8">
        {/* Header */}
        <div>
          <p className="section-label mb-1">Document</p>
          <h1 className="font-display font-extrabold text-2xl text-cream">
            8U Pre-Season Throwing Program
          </h1>
          <p className="text-cream/50 text-sm mt-1 max-w-xl">
            8-week program for pitchers. Two throwing days per week, one delivery drill day,
            one long toss day. Start 8 weeks before your first practice.
          </p>
        </div>

        {/* Core principles */}
        <div className="card p-5">
          <p className="section-label mb-3">Core Principles</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Balance", body: "A good pitch starts from a balanced, athletic stance. If the player can't balance on one leg, he'll struggle with everything else." },
              { label: "Direction", body: "Every part of the body should work toward the target — hips, stride foot, glove, shoulders. Aiming incorrectly forces arm-only throws." },
              { label: "Timing", body: "The throwing arm, stride, and hip rotation must work together. Towel drills and slow mirror work are the best tools for developing timing without arm wear." },
            ].map((p) => (
              <div key={p.label}>
                <p className="font-display font-bold text-red-light text-sm mb-1">{p.label}</p>
                <p className="text-cream/60 text-xs leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly schedule */}
        <div>
          <p className="section-label mb-3">8-Week Schedule</p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-navy-dark text-cream/60">
                  <th className="text-left px-4 py-3 font-display font-bold text-xs uppercase tracking-wide w-16">Week</th>
                  <th className="text-left px-4 py-3 font-display font-bold text-xs uppercase tracking-wide">Throwing Day</th>
                  <th className="text-left px-4 py-3 font-display font-bold text-xs uppercase tracking-wide">Delivery Work</th>
                  <th className="text-left px-4 py-3 font-display font-bold text-xs uppercase tracking-wide">Long Toss</th>
                  <th className="text-left px-4 py-3 font-display font-bold text-xs uppercase tracking-wide">J-Bands</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((w, i) => (
                  <tr
                    key={w.week}
                    className={`border-t border-white/10 align-top
                      ${w.week >= 6 ? "bg-red/5" : i % 2 === 0 ? "bg-white/3" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`font-display font-bold text-base
                        ${w.week >= 6 ? "text-red-light" : "text-cream/50"}`}>
                        {w.week}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cream/80 text-xs whitespace-pre-line leading-relaxed">{w.throwing}</td>
                    <td className="px-4 py-3 text-cream/60 text-xs whitespace-pre-line leading-relaxed">{w.delivery}</td>
                    <td className={`px-4 py-3 text-xs whitespace-pre-line leading-relaxed
                      ${w.longtoss === "OFF" ? "text-cream/25" : "text-cream/70"}`}>
                      {w.longtoss}
                    </td>
                    <td className="px-4 py-3 text-cream/40 text-xs">{w.jbands}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-cream/30 text-xs mt-2">
            Weeks 6–8 include a 20–25 pitch bullpen. Fastballs only throughout.
          </p>
        </div>

        {/* Drill descriptions */}
        <div>
          <p className="section-label mb-3">Drill Descriptions</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {drills.map((d) => (
              <div key={d.name} className="card p-4">
                <p className="font-display font-bold text-cream mb-1">{d.name}</p>
                <p className="text-cream/60 text-sm leading-relaxed">{d.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bullpen card */}
        <div className="card p-5 border-red/20">
          <p className="section-label mb-2">Bullpen Session (Weeks 6–8)</p>
          <p className="text-cream/60 text-sm mb-4">20 pitches — fastballs only — from stretch and wind-up.</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {["From the Stretch", "From the Wind-Up"].map((label) => (
              <div key={label} className="bg-white/5 rounded-lg p-4">
                <p className="font-display font-bold text-cream/80 mb-2">{label}</p>
                <ul className="text-cream/60 text-xs space-y-1">
                  <li>3 FB — Glove side</li>
                  <li>2 FB — Middle</li>
                  <li>3 FB — Arm side</li>
                  <li>2 FB — Low in zone</li>
                  <li className="text-cream/40 pt-1 border-t border-white/10">10 pitches total</li>
                </ul>
              </div>
            ))}
          </div>
          <p className="text-cream/40 text-xs mt-3">
            Focus: repeating delivery every pitch. Throw down in the zone.
            Balance — Direction — Timing on every pitch.
          </p>
        </div>
      </main>
    </div>
  );
}
