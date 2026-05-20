import type { Metadata } from "next";
import { TopNav } from "@/components/ui/TopNav";

export const metadata: Metadata = { title: "Player Skills Rubric" };

const stages = [
  { label: "Introduced", desc: "Exposed to the skill; not yet attempting it consistently", color: "text-cream/40", bg: "bg-white/5" },
  { label: "Developing",  desc: "Attempting with coaching prompts; execution is inconsistent",       color: "text-amber-400",  bg: "bg-amber-400/10" },
  { label: "Proficient",  desc: "Executes correctly without reminders in practice or drills",        color: "text-blue-400",   bg: "bg-blue-400/10" },
  { label: "Automatic",   desc: "Executes correctly under game pressure without thinking about it",  color: "text-green-400",  bg: "bg-green-400/10" },
];

interface SubSkill { label: string; cue: string }
interface Skill    { label: string; cue: string; sub?: SubSkill[] }
interface Category { key: string; label: string; desc: string; when: string; accent: string; skills: Skill[] }

const categories: Category[] = [
  {
    key: "basic-fundamentals",
    label: "Basic Fundamentals",
    desc: "Individual physical skills that form the foundation of every other aspect of the game.",
    when: "Evaluate during warm-ups, fielding practice, and batting practice.",
    accent: "border-l-[#2E5FA3]",
    skills: [
      {
        label: "Throwing",
        cue: "General throwing mechanics and arm strength on any throw",
        sub: [
          { label: "Arm action",   cue: "4-seam grip; elbow up and back; 'L' shape at release; follows through across body" },
          { label: "Arm strength", cue: "Consistent effort and carry on the throw; appropriate velocity for age and distance" },
        ],
      },
      {
        label: "Catch Thrown Ball",
        cue: "Receives throws cleanly and moves to get in line with the ball",
        sub: [
          { label: "Glove up / windshield wiper", cue: "Glove above the waist for high throws; wipes down for low throws; fingers point up" },
          { label: "Thumb to thumb",              cue: "Two-hand catch; receiving hand covers glove after contact" },
          { label: "Moves feet/body to the ball", cue: "Adjusts feet and head to get in direct line rather than reaching across the body" },
        ],
      },
      {
        label: "Catch Fly Ball",
        cue: "Tracks and catches balls in the air with correct technique",
        sub: [
          { label: "Glove up / windshield wiper", cue: "Same glove mechanics as thrown ball; fingers point up on high fly balls" },
          { label: "Thumb to thumb",              cue: "Two hands; securing hand covers glove immediately at catch" },
          { label: "Catch at chin/head level",    cue: "Catches ball in front of face rather than at chest or below waist" },
          { label: "Moves feet/head to the ball", cue: "Tracks early, moves to get under the ball rather than drifting" },
        ],
      },
      {
        label: "Fielding Grounder",
        cue: "Gets in front of ground balls and fields cleanly",
        sub: [
          { label: "Two hands, out front", cue: "Alligator grip; fields ball in front of body, not between feet; glove out front" },
        ],
      },
      {
        label: "Swinging Mechanics",
        cue: "Overall swing mechanics in batting practice or cage work",
        sub: [
          { label: "Balance",       cue: "Balanced stance; weight back at load; finishes balanced on front side" },
          { label: "Load",          cue: "Positive move back before forward; controlled weight transfer begins before pitch arrives" },
          { label: "Hand/arm action", cue: "Short, direct path to the ball; extension at contact; bat stays in zone" },
          { label: "Hip action",    cue: "Hips initiate rotation; hands and bat follow; does not arm-swing" },
        ],
      },
      {
        label: "Hitting Skills",
        cue: "Applied hitting performance in live or coach-pitch situations",
        sub: [
          { label: "Swinging hard",         cue: "Swings with intent and bat speed; not defensive or tentative" },
          { label: "Contact ability",        cue: "Makes consistent contact; can put the ball in play repeatedly" },
          { label: "Strike zone awareness",  cue: "Attacks pitches in the zone; does not chase obvious balls or take hittable pitches" },
        ],
      },
      {
        label: "Base Running",
        cue: "Running technique and decision-making on the bases",
        sub: [
          { label: "Rounding the bag", cue: "Hits inside corner of base; leans into turn; eyes ahead to next base" },
          { label: "Sliding",          cue: "Knows when to slide; executes feet-first slide on target; does not pop up early" },
        ],
      },
      {
        label: "Pitching Mechanics",
        cue: "Physical delivery mechanics evaluated from the mound",
        sub: [
          { label: "Balance",        cue: "Balanced wind-up; controlled leg lift; stable landing foot" },
          { label: "Arm action",     cue: "4-seam grip; elbow up; follows through consistently; arm angle repeatable" },
          { label: "Hip action",     cue: "Hips lead rotation; arm follows in sequence; power transfers from lower half" },
          { label: "Glove position", cue: "Glove stays up and in front during delivery; does not fly open early" },
          { label: "Follow through", cue: "Full arm follow-through across body; lands in fielding position" },
        ],
      },
      {
        label: "Pitching Skills",
        cue: "Applied pitching performance in live situations",
        sub: [
          { label: "Velocity",        cue: "Consistent arm speed and effort; appropriate carry for age" },
          { label: "Strike throwing", cue: "Throws first-pitch strikes; works within zone; hits catcher's target" },
        ],
      },
      {
        label: "Catching Fundamentals",
        cue: "Core skills for the catcher position",
        sub: [
          { label: "Receiving ball",           cue: "Presents a target; receives and frames pitches quietly; two-hand catch" },
          { label: "Positioning behind home",  cue: "Correct squat depth; weight forward; in line with batter's box" },
          { label: "Hustle after passed ball", cue: "Locates ball immediately; communicates to pitcher; sprints to ball" },
        ],
      },
    ],
  },
  {
    key: "basic-situations",
    label: "Basic Situations",
    desc: "Game-situation decisions every player at this level should be developing.",
    when: "Evaluate during scrimmages and live game situations. 'Automatic' means the player reads and reacts correctly without a mid-play coaching prompt.",
    accent: "border-l-[#22c55e]",
    skills: [
      { label: "Covering First Base",     cue: "First baseman gets to bag on all infield grounders; sets up correctly along the base line" },
      { label: "MI Covering Second",      cue: "Shortstop or second baseman covers second on steals and force plays without a coaching prompt" },
      { label: "MI Cutoff (outfield ball)",cue: "Middle infielder positions in direct lane between outfielder and target base as cutoff" },
      { label: "Outfield Throw to Second", cue: "Outfielder's default throw goes to second on base hits; hits cutoff on deeper balls" },
      { label: "Outfield Throw to Cutoff", cue: "Outfielder hits cutoff man on relay situations; throw is on a line, chest-high" },
      {
        label: "Baserunning Decisions",
        cue: "Correct read-and-react on batted balls from any base",
        sub: [
          { label: "Run through first",     cue: "Does not slow before the bag; runs through in foul territory" },
          { label: "Round first",           cue: "Makes aggressive turn; reads whether to advance; retreats safely if holding" },
          { label: "Double",                cue: "Stays wide on first-base turn; sprints through second; reads third base coach" },
          { label: "First to third",        cue: "Aggressive read on outfield hits; rounds second wide; watches third base coach" },
          { label: "Second to home",        cue: "Scores on outfield singles with proper angle; watches third base coach throughout" },
          { label: "Tagging from third",    cue: "Waits at base until catch; gets secondary lead; breaks hard on the tag" },
          { label: "No force, ball in front", cue: "Holds or retreats when ball is fielded in front; does not get caught off base" },
          { label: "Fly ball, less than two outs", cue: "Holds on the base or tags up depending on depth; does not run automatically" },
        ],
      },
      { label: "Baserunning — Listening to Coach", cue: "Eyes find base coach on any close read; responds immediately to stop/go signal without hesitation" },
      { label: "Calling for the Ball",     cue: "Player calls loudly and early; teammates yield when they hear the call" },
      { label: "Force Play vs. Tag Play",  cue: "Fielder correctly identifies whether a force is on; applies tag when no force exists rather than stepping on base" },
      {
        label: "Team Concept",
        cue: "Awareness of role and positioning as part of the defensive unit",
        sub: [
          { label: "Ball, base, or back up", cue: "Every player finds one of these three jobs on every batted ball; no one stands and watches" },
          { label: "Basic positioning",      cue: "Players know where to stand before the pitch based on situation (e.g., infield ready position, outfield depth)" },
        ],
      },
    ],
  },
  {
    key: "intermediate-fundamentals",
    label: "Intermediate Fundamentals",
    desc: "More advanced individual skills that layer on top of the basics.",
    when: "Introduce once basic fundamentals are consistently Proficient or Automatic.",
    accent: "border-l-[#f59e0b]",
    skills: [
      { label: "Forehands & Backhands",      cue: "Extends glove cleanly on wide balls; keeps glove open and firm through the ball" },
      { label: "First Base — Short Hops",    cue: "Stretches correctly; scoops low throws; adjusts feet to handle poor throws" },
      { label: "First Base — Footwork",      cue: "Finds the bag without looking; correct foot on bag based on throw direction; stretches at right time" },
      { label: "Bunting",                    cue: "Square or pivot stance; deadens ball to target zone; bat angle controlled; fair/foul awareness" },
      { label: "Hitting Inside/Outside Pitches", cue: "Pulls inside pitch with hip turn; goes opposite field on outside pitch with extension" },
      { label: "Charging the Ball",          cue: "Reads slow rollers early; charges aggressively; fields and throws in one motion" },
      { label: "Outfield Grounders",         cue: "Gets body in front of ball; does not let ball play through the legs; keeps it in front to limit extra bases" },
      { label: "Outfield Fly Ball Footwork", cue: "Drop step on balls behind; crossover and charge on balls in front; does not backpedal" },
      { label: "Throwing Relays",            cue: "Positions in direct line; catches and redirects quickly with minimal steps; arm up as target" },
      { label: "Infield — Tagging Runner",   cue: "Swipes low tag with back of glove; protects ball; clears quickly after tag" },
      {
        label: "Catching — Next Level",
        cue: "Advanced catcher skills beyond basic fundamentals",
        sub: [
          { label: "Blocking",                  cue: "Drops to knees; body fully in front of ball; channels ball to feet in front of plate" },
          { label: "Throwing to bases",          cue: "Fast footwork after receiving; accurate arm; uses correct footwork pattern for target base" },
          { label: "Fielding in front of home",  cue: "Fields bunts and topped balls; communicates base to throw to; makes accurate play" },
        ],
      },
    ],
  },
  {
    key: "intermediate-situations",
    label: "Intermediate Situations",
    desc: "Team-coordination plays requiring multiple players to execute together.",
    when: "Evaluate primarily through live game situations and structured team defense practice.",
    accent: "border-l-[#a78bfa]",
    skills: [
      { label: "Infield — Where to Throw",        cue: "Correctly identifies force plays at second, third, or home; does not throw to wrong base under pressure" },
      { label: "Infield — Stopping Lead Runner",  cue: "Identifies lead runner; throws ahead of the lead rather than defaulting to first for the routine out" },
      { label: "Backing Up the Play",             cue: "Players without the ball find their backup position on every batted ball — no exceptions" },
      {
        label: "Pop Ups — Infield/Outfield",
        cue: "Multiple fielders converge and communicate on shared pop-up territory",
        sub: [
          { label: "Calling each other off", cue: "Outfielder's call takes priority; infielder yields without collision; non-catcher calls off catcher" },
        ],
      },
      { label: "Catcher — Fielding in Front of Plate", cue: "Fields bunts and slow rollers; communicates base to throw to; makes accurate play under pressure" },
      {
        label: "Team Concept — Advanced Positioning",
        cue: "Alignment adjustments based on game situation beyond basic pre-pitch positioning",
        sub: [
          { label: "Double play depth", cue: "Infield recognizes DP situation; shifts to appropriate depth and alignment" },
          { label: "Infield in",        cue: "Infield recognizes play-at-the-plate situation; moves in and understands the trade-off" },
          { label: "Outfield deep",     cue: "Outfield recognizes late-inning or extra-base-threat situation; shifts depth accordingly" },
        ],
      },
    ],
  },
];

export default function SkillsRubricPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-label mb-1">Document</p>
            <h1 className="font-display font-extrabold text-2xl text-cream">
              Player Skills Rubric
            </h1>
            <p className="text-cream/50 text-sm mt-1 max-w-xl">
              Developmental stage model for evaluating 8U players across fundamentals and game situations.
              Tracks where each player is in their learning journey — not just whether they're "good" at a skill.
            </p>
          </div>
          <a
            href="/docs/player_skills_rubric_v3.docx"
            download
            className="btn-secondary shrink-0 text-sm mt-1"
          >
            ↓ Download .docx
          </a>
        </div>

        {/* Stage Key */}
        <div className="card p-5">
          <p className="section-label mb-3">Developmental Stage Key</p>
          <p className="text-cream/50 text-xs mb-4">
            For each skill, identify the stage that best describes the player right now. A player can be
            at different stages across different skills — that's normal and expected. The goal is to move
            each skill one stage to the right over the course of a season.
          </p>
          <div className="grid sm:grid-cols-4 gap-3">
            {stages.map((s) => (
              <div key={s.label} className={`rounded-lg p-3 ${s.bg}`}>
                <p className={`font-display font-bold text-sm mb-1 ${s.color}`}>{s.label}</p>
                <p className="text-cream/60 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-cream/40 text-xs mt-4">
            For team-wide evaluations, note the distribution across players (e.g. "4 Automatic / 8 Proficient / 3 Developing")
            rather than a single rating.
          </p>
        </div>

        {/* Category sections */}
        {categories.map((cat) => (
          <div key={cat.key}>
            <div className="mb-3">
              <p className="section-label mb-1">{cat.label}</p>
              <p className="text-cream/70 text-sm">{cat.desc}</p>
              <p className="text-cream/40 text-xs mt-1 italic">{cat.when}</p>
            </div>

            <div className={`rounded-xl border border-white/10 overflow-hidden border-l-4 ${cat.accent}`}>
              {cat.skills.map((skill, si) => (
                <div key={skill.label}>
                  {/* Main skill row */}
                  <div className={`px-4 py-3 ${si % 2 === 0 ? "bg-white/3" : ""}`}>
                    <div className="flex gap-3 items-baseline">
                      <p className="font-display font-bold text-cream text-sm shrink-0 w-52">
                        {skill.label}
                      </p>
                      <p className="text-cream/60 text-xs leading-relaxed">{skill.cue}</p>
                    </div>

                    {/* Sub-skills */}
                    {skill.sub && (
                      <div className="mt-2 flex flex-col gap-1.5 pl-4 border-l border-white/10 ml-1">
                        {skill.sub.map((sub) => (
                          <div key={sub.label} className="flex gap-3 items-baseline">
                            <p className="text-cream/50 text-xs shrink-0 w-48 font-medium">
                              › {sub.label}
                            </p>
                            <p className="text-cream/40 text-xs leading-relaxed">{sub.cue}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Divider between skills (not after last) */}
                  {si < cat.skills.length - 1 && (
                    <div className="border-t border-white/5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Evaluation summary note */}
        <div className="card p-5 border-white/5">
          <p className="section-label mb-2">Evaluation Summary</p>
          <p className="text-cream/60 text-sm">
            After evaluating, capture overall impressions by category and identify the top 1–2 focus
            areas for the next practice or game cycle. The downloadable .docx includes a full
            evaluation form with rating circles and notes columns for each skill.
          </p>
        </div>

      </main>
    </div>
  );
}
