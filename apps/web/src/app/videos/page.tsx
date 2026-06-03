"use client";

import { useState } from "react";
import { TopNav } from "@/components/ui/TopNav";
import { PLAYLISTS } from "@/data/playlists";

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState(PLAYLISTS[0].id);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(
    () => new Set([PLAYLISTS[0].id])
  );

  function handleTabClick(id: string) {
    setActiveTab(id);
    setLoadedTabs(prev => new Set(Array.from(prev).concat(id)));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">

        <div>
          <p className="section-label mb-1">Tool</p>
          <h1 className="font-display font-extrabold text-2xl text-cream">
            Video Library
          </h1>
          <p className="text-cream/50 text-sm mt-1">
            Curated coaching videos organized by topic.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2">
          {PLAYLISTS.map(pl => (
            <button
              key={pl.id}
              onClick={() => handleTabClick(pl.id)}
              className={`px-4 py-2 rounded-lg font-display font-semibold text-sm border transition-colors
                ${activeTab === pl.id
                  ? "bg-red/80 text-cream border-red"
                  : "bg-white/5 text-cream/50 border-white/10 hover:text-cream hover:border-white/25"
                }`}
            >
              {pl.label}
            </button>
          ))}
        </div>

        {/* Embeds */}
        {PLAYLISTS.map(pl => (
          <div key={pl.id} className={activeTab === pl.id ? "flex flex-col gap-3" : "hidden"}>
            <div className="aspect-video w-full rounded-xl overflow-hidden">
              {loadedTabs.has(pl.id) && (
                <iframe
                  src={`https://www.youtube.com/embed/videoseries?list=${pl.playlistId}&rel=0`}
                  title={pl.label}
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              )}
            </div>
            <a
              href={`https://www.youtube.com/playlist?list=${pl.playlistId}`}
              target="_blank"
              rel="noopener"
              className="self-start text-sm font-display font-semibold text-cream/40 hover:text-cream/70 transition-colors"
            >
              View full {pl.label} playlist on YouTube ↗
            </a>
          </div>
        ))}

      </main>
    </div>
  );
}
