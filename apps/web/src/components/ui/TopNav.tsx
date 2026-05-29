"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tools = [
  { href: "/practice",      label: "Practice", icon: "📋" },
  { href: "/skills-rubric", label: "Skills",   icon: "📊" },
  { href: "/throwing",      label: "Throwing", icon: "⚾" },
  { href: "/lineup",        label: "Lineup",   icon: "📝" },
  { href: "/defense",       label: "Defense",  icon: "🏟️" },
];

export function TopNav() {
  const path = usePathname();

  return (
    <header className="border-b border-white/10 bg-navy-dark/60 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-12 flex items-center gap-4">
        {/* Home link */}
        <Link
          href="/"
          className="font-display font-bold text-cream/80 hover:text-cream transition-colors text-sm shrink-0"
        >
          ⚾ Coach Tools
        </Link>

        <span className="text-white/20">·</span>

        {/* Tool nav */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tools.map((t) => {
            const active = path.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`font-display font-semibold text-sm px-3 py-1 rounded-md whitespace-nowrap transition-colors
                  ${active
                    ? "bg-red/80 text-cream"
                    : "text-cream/50 hover:text-cream hover:bg-white/10"
                  }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
