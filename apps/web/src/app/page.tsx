import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Coach Tools" };

const tools = [
  {
    href: "/practice",
    label: "Practice Plan Generator",
    description:
      "Build a timed practice plan by duration, location, and focus area. Download as Word doc or spreadsheet.",
    icon: "📋",
    status: "live",
  },
  {
    href: "/skills-rubric",
    label: "Player Skills Rubric",
    description:
      "Developmental stage model for evaluating players across fundamentals and game situations. Reference guide with printable evaluation form.",
    icon: "📊",
    status: "live",
  },
  {
    href: "/throwing",
    label: "Throwing Program",
    description:
      "8-week pre-season throwing program for 8U pitchers. Progressive arm care with drill descriptions.",
    icon: "⚾",
    status: "live",
  },
  {
    href: "/lineup",
    label: "Game Day Lineup",
    description:
      "Generate a full position rotation for a game — minimizes repeat positions and handles bench equitably.",
    icon: "📝",
    status: "live",
  },
  {
    href: "/defense",
    label: "Defensive Responsibilities",
    description:
      "Interactive field diagram — select a base situation and ball in play, see every player's assignment color-coded.",
    icon: "🏟️",
    status: "live",
  },
  {
    href: "/videos",
    label: "Video Library",
    description:
      "Curated YouTube playlists organized by topic — hitting, throwing, fielding, and game situations.",
    icon: "🎬",
    status: "live",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-navy-dark/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">⚾</span>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-cream">
              Coach Tools
            </h1>
            <p className="text-xs text-cream/50 font-sans">La Grange Little League</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-10 pb-6">
        <p className="section-label mb-2">Tools</p>
        <h2 className="font-display font-extrabold text-3xl text-cream leading-tight">
          Coaching Resources
        </h2>
        <p className="text-cream/60 mt-2 text-sm max-w-md">
          Practice planning, defensive assignments, player development — all in one place.
        </p>
      </section>

      {/* Tool cards */}
      <main className="max-w-3xl mx-auto px-4 pb-16 flex-1">
        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 py-4 text-center text-cream/30 text-xs">
        coach.chrislanus.com · LGLL
      </footer>
    </div>
  );
}

function ToolCard({
  href,
  label,
  description,
  icon,
  status,
}: (typeof tools)[number]) {
  const isLive = status === "live";

  const inner = (
    <div
      className={`card p-5 h-full flex flex-col gap-3 transition-all
        ${isLive ? "hover:border-white/25 hover:bg-white/5 cursor-pointer" : "opacity-50 cursor-default"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl">{icon}</span>
        {!isLive && (
          <span className="section-label bg-white/10 px-2 py-0.5 rounded text-cream/40">
            Soon
          </span>
        )}
      </div>
      <div>
        <h3 className="font-display font-bold text-lg text-cream leading-snug">
          {label}
        </h3>
        <p className="text-cream/60 text-sm mt-1 leading-relaxed">{description}</p>
      </div>
      {isLive && (
        <span className="text-red-light font-display font-semibold text-sm mt-auto">
          Open →
        </span>
      )}
    </div>
  );

  return isLive ? <Link href={href}>{inner}</Link> : <div>{inner}</div>;
}
