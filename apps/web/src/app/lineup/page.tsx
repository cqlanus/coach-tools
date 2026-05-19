import type { Metadata } from "next";
import { TopNav } from "@/components/ui/TopNav";

export const metadata: Metadata = { title: "Game Day Lineup" };

export default function LineupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="max-w-3xl mx-auto w-full px-4 py-12 text-center">
        <span className="text-5xl">📝</span>
        <h1 className="font-display font-extrabold text-2xl text-cream mt-4">
          Game Day Lineup Generator
        </h1>
        <p className="text-cream/50 text-sm mt-2 max-w-sm mx-auto">
          Coming soon — generates a full position rotation for a game with minimal
          repeat positions and equitable bench time.
        </p>
      </main>
    </div>
  );
}
