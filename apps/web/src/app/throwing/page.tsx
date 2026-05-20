import type { Metadata } from "next";
import { TopNav } from "@/components/ui/TopNav";

export const metadata: Metadata = { title: "Throwing Program" };

const weeks = [
  {
    week: 1, jbands: "10 reps",
    throwing: "Light Catch (60–70% effort)\n30–40 ft · 6 min\nFocus: Easy, relaxed arm action",
    delivery: "Mirror Work 5–10 min\nTowel Drill 5 min",
    longtoss: "OFF",
  },
  {
    week: 2, jbands: "11 reps",
    throwing: "Light Catch (65–75% effort)\n35–45 ft · 7 min\nFocus: Grip & release",
    delivery: "Mirror Work 5–10 min\nTowel Drill 5 min",
    longtoss: "OFF",
  },
  {
    week: 3, jbands: "12 reps",
    throwing: "Catch (70–80% effort)\n40–50 ft · 8 min\nFocus: Stepping toward target",
    delivery: "Mirror Work 5–10 min\nTowel Drill 5 min",
    longtoss: "Long Toss Intro\nStart 30 ft → 50–60 ft\nArc on every throw\nCrow hop when moving back\nWork back in throwing on a line",
  },
  {
    week: 4, jbands: "12 reps",
    throwing: "Catch (75–85% effort)\n45–55 ft · 9 min\nFocus: Balance & direction",
    delivery: "Mirror Work 5–10 min\nTowel Drill 5 min",
    longtoss: "Out: 30 ft → 60–70 ft · Arc on the way out\nIn: Back down to 45 ft on a line\nFinish: 10 easy throws at 45 ft",
  },
  {
    week: 5, jbands: "13 reps",
    throwing: "Catch (80–85% effort)\n50–60 ft · 10 min\nFocus: Chest-to-chest target",
    delivery: "Mirror Work 5–10 min\nTowel Drill 5 min",
    longtoss: "Out: 30 ft → 65–75 ft · Arc on the way out\nIn: Pull down to 45 ft on a line\nFinish: 10 easy throws at 45 ft",
  },
  {
    week: 6, jbands: "13 reps",
    throwing: "Catch (80–85% effort)\n50–60 ft · 10 min\n+ 20 Pitch Bullpen (FB only)",
    delivery: "Mirror Work 5–10 min\nTowel Drill 5 min",
    longtoss: "Out: 30 ft → 70–80 ft · Arc on the way out\nIn: Pull down to 45 ft on a line\nFinish: 10 easy throws at 45 ft",
  },
  {
    week: 7, jbands: "14 reps",
    throwing: "Catch (80–90% effort)\n55–65 ft · 10 min\n+ 20 Pitch Bullpen (FB only)",
    delivery: "Mirror Work 5–10 min\nTowel Drill 5 min",
    longtoss: "Out: 30 ft → 75–85 ft · Arc on the way out\nIn: Pull down to 45 ft on a line\nFinish: 10 easy throws at 45 ft",
  },
  {
    week: 8, jbands: "14 reps",
    throwing: "Catch (85–90% effort)\n55–65 ft · 11 min\n+ 25 Pitch Bullpen (FB only)",
    delivery: "Mirror Work 5–10 min\nTowel Drill 5 min",
    longtoss: "Out: 30 ft → 80–90 ft · Arc on the way out\nIn: Pull down to 45 ft on a line\nFinish: 10 easy throws at 45 ft",
  },
];

const drills = [
  {
    name: "Catch Play",
    body: "Every throw should be made with intention — correct grip, face your partner, step toward your target, follow through. Throws should not be 'on a line' until Week 3. Before that, a gentle arc on every throw builds arm strength and proper extension. Once distances extend past 50 ft, always use a crow hop to let the legs generate power and take stress off the arm.",
  },
  {
    name: "Mirror Drill",
    body: "Stand in front of a mirror or window. Go through your full delivery slowly — no ball. Watch your balance point, the direction of your stride foot, and whether your shoulders stay level. 5–15 minutes, fully indoors, zero arm stress. All the mechanical benefit.",
  },
  {
    name: "Towel Drill",
    body: "Hold a small hand towel with two fingers on your throwing hand (same grip as a fastball). Go through your full delivery and feel the towel whip out toward a target. Builds extension and finish without loading the arm. Focus on snap and follow-through, not speed.",
  },
  {
    name: "Fastballs Only",
    body: "This entire program is fastballs only — in catch, in long toss, and in the bullpen. A pitcher cannot command any other pitch until he can command his fastball. Developing a consistent fastball grip and release is the single most important mechanical skill at this age. Everything else is built on that foundation.",
  },
];

const armHealthRules = [
  { label: "Never throw through pain.", body: "Soreness after throwing (24–48 hours later, muscles feeling worked) is normal. Sharp pain, joint pain, or soreness in the elbow or shoulder during throwing is a stop sign. Rest, and speak with a parent or doctor before continuing." },
  { label: "Warm up before every session.", body: "Arm circles, trunk rotations, and light jogging for 5 minutes before picking up a ball. J-Band exercises are an excellent optional warm-up." },
  { label: "Cool down after every session.", body: "Arm circles, light stretching of the shoulder and chest. Don't skip this." },
  { label: "Distance matters.", body: "Every week in this program introduces slightly longer throws at slightly more effort. This gradual progression is intentional — resist the urge to skip ahead." },
  { label: "If you miss a week, back up a week.", body: "Arm strength builds in a straight line. Gaps in training require restarting from where you left off, not jumping to the current week." },
];

const howToUse = [
  "This is an 8-week program. If your first practice is March 1st, count back 8 weeks and start the week of January 5th.",
  "Throwing days are suggestions. You can shift Sunday to Monday or Saturday to Friday — just maintain the spacing between sessions (roughly 2–3 days between throwing days).",
  "Long toss begins in Week 3 and increases gradually. Before Week 3, Saturday is a rest day.",
  "Delivery work (mirror drills, towel drills) is low-stress and can be done indoors. These sessions are just as important as throwing days.",
  "J-Band exercises are optional but highly recommended. They strengthen the small muscles around the shoulder that protect against injury.",
  "Every player is different. Some players will be comfortable extending to the longer distances in long toss. Others should stop shorter. Never push beyond where body control starts to break down.",
];

const longtossOut = [
  { dist: "30 ft", throws: "5 throws" },
  { dist: "40 ft", throws: "3 throws (crow hop)" },
  { dist: "50 ft", throws: "3 throws (crow hop)" },
  { dist: "60 ft", throws: "3 throws (crow hop)" },
  { dist: "70 ft", throws: "3 throws (crow hop)" },
  { dist: "80 ft", throws: "3 throws (crow hop) — max for 8U" },
];

const longtossIn = [
  { dist: "70 ft", throws: "2 throws (crow hop, on a line)" },
  { dist: "60 ft", throws: "2 throws (crow hop, on a line)" },
  { dist: "50 ft", throws: "2 throws (crow hop, on a line)" },
  { dist: "40 ft", throws: "2 throws (crow hop, on a line)" },
];

const jbandExercises = [
  "Over-the-head forearm extensions",
  "Side extensions",
  "Diagonal extensions",
  "Forward flies",
  "Reverse flies",
  "Internal rotation",
  "External rotation",
  "Elevated internal rotation",
  "Elevated external rotation",
  "Reverse throwing motion",
  "Forward throwing motion",
];

export default function ThrowingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
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
          <a
            href="/docs/8U-PreSeason-Throwing-Program.docx"
            download
            className="btn-secondary shrink-0 text-sm mt-1"
          >
            ↓ Download .docx
          </a>
        </div>

        {/* Why a Throwing Program */}
        <div className="card p-5 flex flex-col gap-3">
          <p className="section-label">Why a Throwing Program?</p>
          <p className="text-cream/70 text-sm leading-relaxed">
            Pitching a baseball is one of the most demanding athletic motions a young body can make.
            Done well and with proper preparation, it is also one of the most rewarding skills in sports.
            This program exists for one reason: to help your pitcher arrive at the first practice healthy,
            confident, and ready to compete.
          </p>
          <p className="text-cream/60 text-sm leading-relaxed">
            A pre-season throwing program is not about throwing as hard or as often as possible. It is
            about building arm strength gradually, developing consistent mechanics, and protecting the
            elbow and shoulder from unnecessary stress. This program asks for two throwing days per week,
            one delivery drill day, and one long toss day — a manageable commitment that will pay
            dividends all season long.
          </p>
        </div>

        {/* Arm Health */}
        <div className="card p-5">
          <p className="section-label mb-3">Arm Health Comes First</p>
          <p className="text-cream/60 text-sm mb-4">
            At this age, arm health is everything. A pitcher who stays healthy all season contributes
            far more to his team than one who throws hard for two weeks and then sits with a sore arm.
          </p>
          <div className="flex flex-col gap-3">
            {armHealthRules.map((r) => (
              <div key={r.label} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-light shrink-0 mt-1.5" />
                <p className="text-cream/70 text-sm leading-relaxed">
                  <span className="font-bold text-cream">{r.label}</span>{" "}{r.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Principles */}
        <div className="card p-5">
          <p className="section-label mb-3">Core Principles</p>
          <p className="text-cream/50 text-xs mb-4">
            At 8U, the goal is not a perfect textbook delivery. The goal is a simple, repeatable
            motion that a player can produce under pressure, pitch after pitch.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Balance", body: "A good pitch starts from a balanced, athletic stance. If the player cannot balance on one leg during his delivery, he will struggle with everything else. Mirror drills and towel drills isolate balance work without the complexity of actually throwing." },
              { label: "Direction", body: "Every part of the body should be working toward the target — hips, stride foot, glove, shoulders. Young pitchers who aim incorrectly often correct by using only their arm, which creates arm strain and command problems." },
              { label: "Timing", body: "The throwing arm, the stride, and the hip rotation all need to work together. When timing is off, even a physically gifted pitcher loses command and velocity. Towel drills and slow mirror work are the best tools for developing timing without wear on the arm." },
            ].map((p) => (
              <div key={p.label}>
                <p className="font-display font-bold text-red-light text-sm mb-1">{p.label}</p>
                <p className="text-cream/60 text-xs leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to Use */}
        <div className="card p-5">
          <p className="section-label mb-3">How to Use This Program</p>
          <div className="flex flex-col gap-2">
            {howToUse.map((item, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-cream/25 text-xs font-mono mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-cream/70 text-sm leading-relaxed">{item}</p>
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
            Focus: repeating delivery every pitch. Throw down in the zone — aim below the letters,
            knees are even better. Balance — Direction — Timing on every pitch.
          </p>
        </div>

        {/* Long Toss Routine */}
        <div className="card p-5">
          <p className="section-label mb-2">Long Toss Routine</p>
          <p className="text-cream/50 text-xs mb-4">
            Arc on the way out (feel extension). Throw on a line on the way in.
            Stop when body control starts to break down — never push past that point.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="font-display font-bold text-cream/80 text-xs uppercase tracking-wide mb-2">On the Way Out — Arc every throw</p>
              <div className="flex flex-col gap-1">
                {longtossOut.map((r) => (
                  <div key={r.dist} className="flex gap-3 text-xs">
                    <span className="text-red-light font-mono font-bold w-12 shrink-0">{r.dist}</span>
                    <span className="text-cream/60">{r.throws}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-display font-bold text-cream/80 text-xs uppercase tracking-wide mb-2">On the Way In — Throw on a line</p>
              <div className="flex flex-col gap-1 mb-3">
                {longtossIn.map((r) => (
                  <div key={r.dist} className="flex gap-3 text-xs">
                    <span className="text-cream/40 font-mono font-bold w-12 shrink-0">{r.dist}</span>
                    <span className="text-cream/60">{r.throws}</span>
                  </div>
                ))}
              </div>
              <p className="text-cream/50 text-xs">Finish: 10 easy throws at 30–45 ft — hit your partner's chest.</p>
              <p className="text-cream/50 text-xs mt-1">Spin Drill: 45 ft, 8–10 spins — focus on ball spin, not speed.</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-1">
            {[
              "Crow-hop throws: hit your partner in the chest. Emphasize getting the front side up and using your legs.",
              "On the way out: arc every throw. Feel extension through your fingertips.",
              "On the way in: feel the ground, drive through each throw. You should feel on top of the ball.",
              "Adjust distances based on the player. Never extend beyond where body control breaks down.",
            ].map((cue, i) => (
              <div key={i} className="flex gap-2 text-xs text-cream/50">
                <span className="text-red-light shrink-0">▸</span>
                <span>{cue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* J-Band Exercises */}
        <div className="card p-5">
          <p className="section-label mb-2">J-Band Exercises <span className="text-cream/30 font-sans font-normal normal-case tracking-normal">(Optional)</span></p>
          <p className="text-cream/60 text-sm mb-4">
            J-Bands strengthen the rotator cuff and the small stabilizing muscles of the shoulder —
            the same muscles most at risk for overuse injury in young pitchers. Do them before and
            after each throwing session.
          </p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 mb-4">
            {jbandExercises.map((ex) => (
              <div key={ex} className="flex gap-2 text-xs text-cream/60">
                <span className="text-cream/25 shrink-0">—</span>
                <span>{ex}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1 pt-4 border-t border-white/10">
            {[
              "Start with 10 reps per exercise in Week 1, increasing by 1 rep per week up to 15 reps.",
              "Quality over quantity — slow, controlled movement is better than fast, sloppy reps.",
              "Work to the point of fatigue, not failure. If your form breaks down, stop.",
              "The band should NEVER be stretched more than 1–2 feet beyond its resting length.",
              "Never let the clip align with your face or head.",
              "Instruction sheets available from Jaeger Sports (jaegers.com) or ask your coach.",
            ].map((note, i) => (
              <div key={i} className="flex gap-2 text-xs text-cream/50">
                <span className="text-red-light shrink-0">▸</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center text-cream/30 text-sm font-display font-bold tracking-widest uppercase pb-4">
          Balance — Direction — Timing
        </p>

      </main>
    </div>
  );
}
