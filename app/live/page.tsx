import { Navbar } from "@/components/navbar";
import { Radio, Play, Lock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { TournamentLogo } from "@/components/ui/tournament-logo";

// --- DIRECT API FETCHER ---
async function fetchDirectLiveMatches() {
  const apiKey = process.env.PANDASCORE_API_KEY;
  if (!apiKey) return null;

  try {
    // Fetch currently running matches across all esports
    const res = await fetch(
      `https://api.pandascore.co/matches/running?sort=-begin_at&page[size]=6&token=${apiKey}`,
      { next: { revalidate: 60 } } // Revalidate every 60 seconds for live scores
    );

    if (!res.ok) return null;

    const data = await res.json();
    
    return data.map((m: any) => ({
      id: String(m.id),
      game: m.videogame?.name || "ESPORTS",
      tournName: m.league?.name || "Global League",
      teamA: m.opponents?.[0]?.opponent?.name || "TBD",
      teamB: m.opponents?.[1]?.opponent?.name || "TBD",
      scoreA: m.results?.[0]?.score || 0,
      scoreB: m.results?.[1]?.score || 0,
      streamUrl: m.official_stream_url || null,
      logoUrl: m.league?.image_url || null, 
    }));
  } catch (error) {
    console.error("Direct fetch failed:", error);
    return null;
  }
}

// --- THE FALLBACK DATA ---
const getDummyLiveMatches = () => {
  return [
    {
      id: "live-dummy-1",
      game: "VALORANT",
      tournName: "VCT 2026: Masters",
      teamA: "SEN",
      teamB: "LOUD",
      scoreA: 1,
      scoreB: 1,
      streamUrl: "https://twitch.tv/valorant",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/45/Valorant_Champions_Tour_logo.svg",
    },
    {
      id: "live-dummy-2",
      game: "CSGO",
      tournName: "IEM Katowice 2026",
      teamA: "NAVI",
      teamB: "Vitality",
      scoreA: 12,
      scoreB: 14,
      streamUrl: "https://twitch.tv/ESL_CSGO",
      logoUrl: null, 
    },
    {
      id: "live-dummy-3",
      game: "LoL",
      tournName: "LCK Spring 2026",
      teamA: "T1",
      teamB: "Dplus KIA",
      scoreA: 2,
      scoreB: 0,
      streamUrl: "https://twitch.tv/lck",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2a/LoL_Esports_logo.svg",
    }
  ];
};

export default async function LiveMatchesPage() {
  let matches = await fetchDirectLiveMatches();
  let isUsingFallback = false;

  if (!matches || matches.length === 0) {
    matches = getDummyLiveMatches();
    isUsingFallback = true;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
      <Navbar />
      
      <main className="container mx-auto max-w-[1200px] p-6 mt-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8 gap-4">
          <div>
            <h1 className="flex items-center gap-3 font-black uppercase tracking-tighter text-4xl md:text-5xl italic leading-[0.85]">
              <div className="relative flex items-center justify-center">
                 <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-20"></span>
                 <Radio className="w-10 h-10 text-red-600 relative z-10" />
              </div>
              Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Operations`</span>
            </h1>
            <p className="mt-2 font-bold uppercase text-[10px] tracking-widest text-zinc-400">
              // ACTIVE_COMBAT_ZONES // REAL_TIME_TRACKING
            </p>
          </div>
          
          {isUsingFallback && (
            <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 font-bold uppercase text-[9px] tracking-widest rounded-sm animate-pulse">
              // USING SIMULATED DATA
            </div>
          )}
        </div>

        {/* The Live Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {matches.map((match: any) => {
            return (
              <div 
                key={match.id} 
                className="group flex flex-col justify-between bg-zinc-900/60 border border-red-900/30 rounded-sm overflow-hidden hover:border-red-500/50 transition-all duration-300 relative"
              >
                {/* Active Scanning Line Overlay */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/50 opacity-0 group-hover:opacity-100 group-hover:animate-scan pointer-events-none" />

                {/* Top: Labels & Logo */}
                <div className="p-4 pb-0 flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <span className="bg-red-900/30 text-red-500 font-bold uppercase text-[9px] px-2 py-1 tracking-wider border border-red-500/20 w-fit">
                      {match.game}
                    </span>
                    <span className="flex items-center gap-1 font-bold uppercase text-[9px] text-red-500 tracking-widest animate-pulse">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> IN PROGRESS
                    </span>
                  </div>
                  
                  <div className="w-10 h-10 flex items-center justify-center bg-zinc-950/50 border border-zinc-800 rounded-md p-1.5 shadow-inner">
                    <TournamentLogo src={match.logoUrl} alt={match.tournName} />
                  </div>
                </div>

                {/* Middle: The Scoreboard */}
                <div className="p-6 flex flex-col items-center justify-center">
                  <h4 className="font-bold text-[10px] text-zinc-500 uppercase tracking-widest mb-4 text-center">
                    {match.tournName}
                  </h4>
                  
                  <div className="flex items-center justify-center w-full gap-6">
                    <span className="font-black italic text-2xl md:text-3xl w-1/3 text-right truncate text-white">
                      {match.teamA}
                    </span>
                    
                    <div className="flex items-center justify-center gap-3 bg-black/50 border border-zinc-800 px-4 py-2 rounded-md">
                      <span className="font-mono text-xl font-bold text-emerald-400">{match.scoreA}</span>
                      <span className="text-zinc-600 text-sm">-</span>
                      <span className="font-mono text-xl font-bold text-emerald-400">{match.scoreB}</span>
                    </div>

                    <span className="font-black italic text-2xl md:text-3xl w-1/3 text-left truncate text-white">
                      {match.teamB}
                    </span>
                  </div>
                </div>

                {/* Bottom: Actions */}
                <div className="p-4 border-t border-zinc-800/50 bg-black/60 flex justify-between items-center gap-4">
                  
                  {/* Lock Indicator */}
                  <div className="flex items-center gap-1.5 text-zinc-500 bg-zinc-950/50 px-2 py-1.5 rounded border border-zinc-800/50 flex-grow">
                    <Lock className="w-3 h-3 text-red-500/70" />
                    <span className="font-mono text-[9px] uppercase tracking-tighter">
                      Prediction Window Closed
                    </span>
                  </div>

                  {/* Stream Button */}
                  {match.streamUrl ? (
                    <a 
                      href={match.streamUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-[10px] tracking-widest px-4 py-2 rounded transition-colors whitespace-nowrap"
                    >
                      <Play className="w-3 h-3 fill-current" /> Stream
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 bg-zinc-800 text-zinc-500 font-bold uppercase text-[10px] tracking-widest px-4 py-2 rounded cursor-not-allowed whitespace-nowrap">
                      <ShieldAlert className="w-3 h-3" /> No Feed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}