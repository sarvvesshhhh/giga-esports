import { Navbar } from "@/components/navbar";
import { Calendar, Clock, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { PredictionButtons } from "@/components/ui/prediction-buttons"; 
import { db } from "@/lib/db"; // <--- ADDED DB
import { auth } from "@clerk/nextjs/server"; // <--- ADDED AUTH
import { LocalTime } from "@/components/ui/local-time";

// --- DIRECT API FETCHER ---
async function fetchDirectSchedule() {
  const apiKey = process.env.PANDASCORE_API_KEY;
  if (!apiKey) return null;

  try {
    // Fetch upcoming matches directly from PandaScore (across all games)
    const res = await fetch(
      `https://api.pandascore.co/matches/upcoming?sort=begin_at&page[size]=15&token=${apiKey}`,
      { next: { revalidate: 60 } } // Cache for 1 minute instead of 1 hour to prevent stale live data
    );

    if (!res.ok) return null;

    const data = await res.json();
    const now = new Date();
    
    // Normalize the PandaScore data to fit our UI
    return data
      .filter((m: any) => new Date(m.begin_at) > now) // Filter out matches that have already started
      .slice(0, 8) // Ensure we only take 8 after filtering
      .map((m: any) => ({
      id: String(m.id),
      game: m.videogame?.name || "ESPORTS",
      tournName: m.league?.name || "Pro Event",
      // PREFER ACRONYM OVER FULL NAME TO PREVENT TRUNCATION
      teamA: m.opponents?.[0]?.opponent?.acronym || m.opponents?.[0]?.opponent?.name || "TBD",
      teamB: m.opponents?.[1]?.opponent?.acronym || m.opponents?.[1]?.opponent?.name || "TBD",
      // GRAB LOGOS FOR AESTHETICS
      logoA: m.opponents?.[0]?.opponent?.image_url || null,
      logoB: m.opponents?.[1]?.opponent?.image_url || null,
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
      logoA: "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Paper_Rex_logo.svg/1200px-Paper_Rex_logo.svg.png",
      logoB: "https://upload.wikimedia.org/wikipedia/en/thumb/4/43/DRX_logo.svg/1200px-DRX_logo.svg.png",
      startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 1).toISOString(),
      status: "SCHEDULED",
    },
    {
      id: "dummy-2",
      game: "CSGO",
      tournName: "IEM Katowice 2026",
      teamA: "FaZe",
      teamB: "NAVI",
      logoA: "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/FaZe_Clan_logo.svg/1200px-FaZe_Clan_logo.svg.png",
      logoB: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Natus_Vincere_logo.svg/1200px-Natus_Vincere_logo.svg.png",
      startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 1).toISOString(),
      status: "SCHEDULED",
    },
    {
      id: "dummy-3",
      game: "LoL",
      tournName: "LCK Spring 2026",
      teamA: "T1",
      teamB: "Gen.G",
      logoA: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/T1_logo.svg/1200px-T1_logo.svg.png",
      logoB: "https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Gen.G_logo.svg/1200px-Gen.G_logo.svg.png",
      startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      status: "SCHEDULED",
    },
    {
      id: "dummy-4",
      game: "PUBGM",
      tournName: "PMGC 2026 Global Finals",
      teamA: "IHC",
      teamB: "A7",
      logoA: null,
      logoB: null,
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

  // --- NEW: FETCH USER'S EXISTING PICKS FROM DB ---
  const { userId: clerkId } = await auth();
  let userPredictions: Record<string, string> = {}; // Format: { matchId: "TeamPicked" }

  if (clerkId) {
    const user = await db.user.findUnique({ where: { clerkId } });
    if (user) {
      // THE FIX: Removed 'outcome: "PENDING"' so it fetches ALL your past picks!
      const predictions = await db.prediction.findMany({
        where: { userId: user.id } 
      });
      
      // Populate a fast-lookup dictionary
      predictions.forEach(p => {
        userPredictions[p.matchId] = p.pick;
      });
    }
  }
  // ------------------------------------------------

  return (
    // Changed bg to transparent so the layout grid shows through
    <div className="min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 font-sans">
      <Navbar />
      
      <main className="container mx-auto max-w-[1200px] p-6 mt-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8 gap-4">
          <div>
            <h1 className="flex items-center gap-3 font-black uppercase tracking-tighter text-4xl md:text-5xl italic leading-[0.85]">
              <Calendar className="w-10 h-10 text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
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
            return (
              <div 
                key={match.id} 
                className="group relative flex flex-col md:flex-row items-center justify-between bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-5 rounded-lg hover:border-red-600/50 hover:bg-zinc-900/60 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(220,38,38,0.1)] overflow-hidden"
              >
                {/* Tactical Side Bar */}
                <div className="absolute left-0 top-0 w-1 h-full bg-zinc-800 group-hover:bg-red-600 transition-colors duration-500 shadow-[0_0_10px_rgba(220,38,38,0)] group-hover:shadow-[0_0_10px_rgba(220,38,38,0.8)]" />

                {/* Left: Game & Tournament */}
                <div className="flex flex-col w-full md:w-1/4 mb-6 md:mb-0 pl-2">
                  <span className="bg-red-900/30 text-red-500 font-bold uppercase text-[9px] px-2 py-1 tracking-wider border border-red-500/20 w-fit backdrop-blur-sm">
                    {match.game}
                  </span>
                  <h3 className="mt-2 font-bold text-xs text-zinc-400 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">
                    {match.tournName}
                  </h3>
                </div>

                {/* Center: The Matchup (FIXED TRUNCATION & ADDED LOGOS) */}
                <div className="flex items-center justify-center w-full md:w-1/2 gap-4 px-4">
                  {/* Team A */}
                  <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
                    <span className="font-black italic text-xl md:text-2xl truncate text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all">
                      {match.teamA}
                    </span>
                    {match.logoA && (
                      <img src={match.logoA} alt={match.teamA} className="w-8 h-8 object-contain drop-shadow-lg shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {/* VS Divider */}
                  <div className="flex flex-col items-center justify-center shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Swords className="w-4 h-4 text-red-500 mb-1" />
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">VS</span>
                  </div>

                  {/* Team B */}
                  <div className="flex items-center justify-start gap-3 flex-1 min-w-0">
                    {match.logoB && (
                      <img src={match.logoB} alt={match.teamB} className="w-8 h-8 object-contain drop-shadow-lg shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                    )}
                    <span className="font-black italic text-xl md:text-2xl truncate text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all">
                      {match.teamB}
                    </span>
                  </div>
                </div>

                {/* Right: Time & Status & Prediction Buttons */}
                <div className="flex flex-col items-end justify-between w-full md:w-1/4 mt-6 md:mt-0 bg-black/40 p-3 rounded border border-zinc-800/50 group-hover:border-zinc-700 transition-colors">
                    <div className="w-full flex flex-col items-end">
                      <LocalTime isoString={match.startTime} />
                    </div>
                  
                  {/* INJECTED BUTTONS HERE */}
                  <div className="w-full mt-3 pt-3 border-t border-zinc-800/80">
                      <PredictionButtons 
                        matchId={match.id} 
                        teamA={match.teamA} 
                        teamB={match.teamB} 
                        gameName={match.game}
                        tournName={match.tournName} 
                        initialPick={userPredictions[match.id]} 
                      />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}