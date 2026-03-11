import { Navbar } from "@/components/navbar";
import { Trophy, CalendarDays, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TournamentLogo } from "@/components/ui/tournament-logo"; // <-- NEW IMPORT

// --- DIRECT API FETCHER ---
async function fetchDirectTournaments() {
  const apiKey = process.env.PANDASCORE_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.pandascore.co/tournaments?filter[tier]=s,a&sort=-begin_at&page[size]=6&token=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    
    return data.map((t: any) => ({
      id: String(t.id),
      game: t.videogame?.name || "ESPORTS",
      leagueName: t.league?.name || "Global League",
      tournName: t.name || "Main Event",
      tier: t.tier ? t.tier.toUpperCase() : "A",
      beginAt: t.begin_at,
      endAt: t.end_at,
      logoUrl: t.league?.image_url || t.serie?.logo_url || null, 
    }));
  } catch (error) {
    console.error("Direct fetch failed:", error);
    return null;
  }
}

// --- THE FALLBACK DATA ---
const getDummyTournaments = () => {
  return [
    {
      id: "t-dummy-1",
      game: "VALORANT",
      leagueName: "VCT 2026",
      tournName: "Masters Madrid",
      tier: "S",
      beginAt: "2026-03-14T00:00:00Z",
      endAt: "2026-03-24T00:00:00Z",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/45/Valorant_Champions_Tour_logo.svg",
    },
    {
      id: "t-dummy-2",
      game: "CSGO",
      leagueName: "PGL Major 2026",
      tournName: "Copenhagen Finals",
      tier: "S",
      beginAt: "2026-03-17T00:00:00Z",
      endAt: "2026-03-31T00:00:00Z",
      logoUrl: null, 
    },
    {
      id: "t-dummy-3",
      game: "LoL",
      leagueName: "MSI 2026",
      tournName: "Group Stage",
      tier: "S",
      beginAt: "2026-05-01T00:00:00Z",
      endAt: "2026-05-20T00:00:00Z",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2a/LoL_Esports_logo.svg",
    },
    {
      id: "t-dummy-4",
      game: "PUBGM",
      leagueName: "PMGO 2026",
      tournName: "Main Event - Brazil",
      tier: "A",
      beginAt: "2026-04-05T00:00:00Z",
      endAt: "2026-04-10T00:00:00Z",
      logoUrl: null,
    },
    {
      id: "t-dummy-5",
      game: "DOTA 2",
      leagueName: "ESL One 2026",
      tournName: "Birmingham",
      tier: "A",
      beginAt: "2026-04-22T00:00:00Z",
      endAt: "2026-04-28T00:00:00Z",
      logoUrl: null,
    },
    {
      id: "t-dummy-6",
      game: "Rainbow Six",
      leagueName: "Six Invitational",
      tournName: "Playoffs",
      tier: "S",
      beginAt: "2026-02-15T00:00:00Z",
      endAt: "2026-02-25T00:00:00Z",
      logoUrl: null,
    },
  ];
};

export default async function TournamentsPage() {
  let tournaments = await fetchDirectTournaments();
  let isUsingFallback = false;

  if (!tournaments || tournaments.length === 0) {
    tournaments = getDummyTournaments();
    isUsingFallback = true;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
      <Navbar />
      
      <main className="container mx-auto max-w-[1200px] p-6 mt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8 gap-4">
          <div>
            <h1 className="flex items-center gap-3 font-black uppercase tracking-tighter text-4xl md:text-5xl italic leading-[0.85]">
              <Trophy className="w-10 h-10 text-red-600" />
              Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Tournaments`</span>
            </h1>
            <p className="mt-2 font-bold uppercase text-[10px] tracking-widest text-zinc-400">
              // GLOBAL_BRACKETS // TIER_1_EVENTS
            </p>
          </div>
          
          {isUsingFallback && (
            <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 font-bold uppercase text-[9px] tracking-widest rounded-sm animate-pulse">
              // USING SIMULATED DATA
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t: any) => {
            const beginDate = t.beginAt ? new Date(t.beginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD';
            const endDate = t.endAt ? new Date(t.endAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD';
            const isActive = t.beginAt && new Date(t.beginAt) <= new Date() && (!t.endAt || new Date(t.endAt) >= new Date());

            return (
              <div 
                key={t.id} 
                className="group relative flex flex-col justify-between bg-zinc-900/40 border border-zinc-800 rounded-sm overflow-hidden hover:border-red-600/50 transition-all duration-300 min-h-[220px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="p-5 pb-0 flex justify-between items-start z-10">
                  <div className="flex flex-col gap-2">
                    <span className="bg-red-900/30 text-red-500 font-bold uppercase text-[9px] px-2 py-1 tracking-wider border border-red-500/20 w-fit">
                      {t.game}
                    </span>
                    {isActive ? (
                      <span className="flex items-center gap-1 font-bold uppercase text-[9px] text-emerald-500 tracking-widest animate-pulse">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> LIVE
                      </span>
                    ) : (
                      <span className="font-bold uppercase text-[9px] text-zinc-500 tracking-widest">
                        UPCOMING
                      </span>
                    )}
                  </div>
                  
                  {/* CLEANED UP LOGO IMPLEMENTATION */}
                  <div className="w-12 h-12 flex items-center justify-center bg-zinc-950/50 border border-zinc-800 rounded-md p-2 shadow-inner">
                    <TournamentLogo src={t.logoUrl} alt={t.leagueName} />
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-center z-10">
                  <h3 className="font-black uppercase text-2xl italic tracking-tighter leading-tight text-white mb-1">
                    {t.leagueName}
                  </h3>
                  <h4 className="font-bold text-sm text-zinc-400 uppercase tracking-wide">
                    {t.tournName}
                  </h4>
                </div>

                <div className="p-4 border-t border-zinc-800/50 bg-black/40 flex justify-between items-center z-10">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <CalendarDays className="w-4 h-4 text-zinc-500" />
                    <span className="font-mono text-[10px] uppercase">
                      {beginDate} - {endDate}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-zinc-500">
                    <Globe2 className="w-3 h-3" />
                    TIER <span className={cn(t.tier === 'S' ? "text-yellow-500" : "text-zinc-300")}>{t.tier}</span>
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