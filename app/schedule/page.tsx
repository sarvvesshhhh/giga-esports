import { Navbar } from "@/components/navbar";
import { Calendar, Clock, Swords } from "lucide-react";

// --- DIRECT API FETCHER ---
async function fetchDirectSchedule() {
  const apiKey = process.env.PANDASCORE_API_KEY;
  if (!apiKey) return null;

  try {
    // Fetch upcoming matches directly from PandaScore (across all games)
    const res = await fetch(
      `https://api.pandascore.co/matches/upcoming?sort=begin_at&page[size]=8&token=${apiKey}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!res.ok) return null;

    const data = await res.json();
    
    // Normalize the PandaScore data to fit our UI
    return data.map((m: any) => ({
      id: String(m.id),
      game: m.videogame?.name || "ESPORTS",
      tournName: m.league?.name || "Pro Event",
      teamA: m.opponents?.[0]?.opponent?.name || "TBD",
      teamB: m.opponents?.[1]?.opponent?.name || "TBD",
      startTime: m.begin_at,
      status: "SCHEDULED",
    }));
  } catch (error) {
    console.error("Direct fetch failed:", error);
    return null;
  }
}

// --- THE FALLBACK DATA ---
const getDummySchedule = () => {
  const now = new Date();
  return [
    {
      id: "dummy-1",
      game: "VALORANT",
      tournName: "VCT 2026: Pacific Stage 1",
      teamA: "PRX",
      teamB: "DRX",
      startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 1).toISOString(),
      status: "SCHEDULED",
    },
    {
      id: "dummy-2",
      game: "CSGO",
      tournName: "IEM Katowice 2026",
      teamA: "FaZe",
      teamB: "NAVI",
      startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 1).toISOString(),
      status: "SCHEDULED",
    },
    {
      id: "dummy-3",
      game: "LoL",
      tournName: "LCK Spring 2026",
      teamA: "T1",
      teamB: "Gen.G",
      startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      status: "SCHEDULED",
    },
    {
      id: "dummy-4",
      game: "PUBGM",
      tournName: "PMGC 2026 Global Finals",
      teamA: "IHC",
      teamB: "A7",
      startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      status: "SCHEDULED",
    },
  ];
};

export default async function SchedulePage() {
  // 1. Try to fetch real data directly from the API
  let matches = await fetchDirectSchedule();
  let isUsingFallback = false;

  // 2. If API fails, rate-limits, or has no data, trigger the fallback
  if (!matches || matches.length === 0) {
    matches = getDummySchedule();
    isUsingFallback = true;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
      <Navbar />
      
      <main className="container mx-auto max-w-[1000px] p-6 mt-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8 gap-4">
          <div>
            <h1 className="flex items-center gap-3 font-black uppercase tracking-tighter text-4xl md:text-5xl italic leading-[0.85]">
              <Calendar className="w-10 h-10 text-red-600" />
              Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Schedule`</span>
            </h1>
            <p className="mt-2 font-bold uppercase text-[10px] tracking-widest text-zinc-400">
              // UPCOMING_PROTOCOLS // ALL_REGIONS
            </p>
          </div>
          
          {/* Fallback Indicator */}
          {isUsingFallback && (
            <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 font-bold uppercase text-[9px] tracking-widest rounded-sm animate-pulse">
              // USING SIMULATED DATA
            </div>
          )}
        </div>

        {/* The Schedule List */}
        <div className="space-y-4">
          {matches.map((match: any) => {
            const matchDate = new Date(match.startTime);
            const dateString = matchDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const timeString = matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            return (
              <div 
                key={match.id} 
                className="group flex flex-col md:flex-row items-center justify-between bg-zinc-900/40 border border-zinc-800 p-4 rounded-sm hover:border-red-600/50 transition-colors"
              >
                {/* Left: Game & Tournament */}
                <div className="flex items-center w-full md:w-1/3 mb-4 md:mb-0 gap-4">
                  <div className="w-1 h-12 bg-zinc-800 group-hover:bg-red-600 transition-colors"></div>
                  <div>
                    <span className="bg-red-900/30 text-red-500 font-bold uppercase text-[9px] px-2 py-1 tracking-wider">
                      {match.game}
                    </span>
                    <h3 className="mt-2 font-bold text-sm text-zinc-300 uppercase tracking-wide">
                      {match.tournName}
                    </h3>
                  </div>
                </div>

                {/* Center: The Matchup */}
                <div className="flex items-center justify-center w-full md:w-1/3 gap-4">
                  <span className="font-black italic text-xl w-24 text-right truncate">
                    {match.teamA}
                  </span>
                  <Swords className="w-4 h-4 text-zinc-600" />
                  <span className="font-black italic text-xl w-24 text-left truncate">
                    {match.teamB}
                  </span>
                </div>

                {/* Right: Time & Status */}
                <div className="flex flex-col items-end w-full md:w-1/3 mt-4 md:mt-0">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono text-sm uppercase">
                      {dateString} - {timeString}
                    </span>
                  </div>
                  <span className="mt-1 font-bold text-[10px] tracking-widest uppercase text-zinc-600">
                    {match.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}