import { getUpcomingMatches } from "@/lib/pandascore";
import Link from "next/link"; // <--- IMPORT THIS

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const matches = await getUpcomingMatches();

  return (
    <main className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter text-white">
          WARFARE <span className="text-red-600">SCHEDULE</span>
        </h1>
        <span className="px-2 py-1 bg-red-900/20 border border-red-900 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded">
          VALORANT • BGMI • FREE FIRE
        </span>
      </div>

      <div className="space-y-4">
        {matches && matches.length > 0 ? (
          matches.map((match: any) => {
            const gameSlug = match.videogame.slug;
            // Color code based on game
            const isValo = gameSlug.includes("valorant");
            const isPubg = gameSlug.includes("pubg");
            const borderColor = isValo ? "group-hover:border-red-600" : isPubg ? "group-hover:border-yellow-500" : "group-hover:border-gray-500";

            return (
              // LINK WRAPPER STARTS HERE
              <Link href={`/schedule/${match.id}`} key={match.id} className="block">
                <div className={`bg-[#0a0a0a] border border-[#222] p-4 rounded transition-all group relative overflow-hidden ${borderColor}`}>
                  
                  {/* GAME BADGE BACKGROUND */}
                  <div className="absolute top-0 right-0 text-[100px] font-black text-white/5 opacity-0 group-hover:opacity-10 pointer-events-none uppercase -translate-y-4 translate-x-4 transition-opacity">
                    {match.videogame.slug.split("-")[0]}
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                    
                    {/* TIME & GAME */}
                    <div className="flex flex-row md:flex-col items-center md:items-start gap-3 w-full md:w-32">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-[#151515] px-2 py-1 rounded border border-[#333]">
                          {match.videogame.name}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                          {new Date(match.begin_at).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                          })}
                      </span>
                    </div>

                    {/* MATCHUP */}
                    <div className="flex-1 flex items-center justify-center gap-6 w-full">
                      {/* TEAM 1 */}
                      <div className="flex items-center gap-3 text-right flex-1 justify-end">
                        <span className="font-bold text-lg leading-none group-hover:text-white transition-colors">{match.opponents[0]?.opponent?.name || "TBD"}</span>
                        {match.opponents[0]?.opponent?.image_url && (
                          <img src={match.opponents[0].opponent.image_url} alt="T1" className="w-8 h-8 object-contain" />
                        )}
                      </div>

                      <div className="text-red-600 font-black italic text-xl group-hover:scale-110 transition-transform">VS</div>

                      {/* TEAM 2 */}
                      <div className="flex items-center gap-3 text-left flex-1 justify-start">
                        {match.opponents[1]?.opponent?.image_url && (
                          <img src={match.opponents[1].opponent.image_url} alt="T2" className="w-8 h-8 object-contain" />
                        )}
                        <span className="font-bold text-lg leading-none group-hover:text-white transition-colors">{match.opponents[1]?.opponent?.name || "TBD"}</span>
                      </div>
                    </div>

                    {/* LEAGUE INFO */}
                    <div className="w-full md:w-32 text-center md:text-right text-[10px] text-gray-500 uppercase tracking-wider">
                      {match.league.name}
                      <br />
                      <span className="text-gray-600">{match.serie.full_name}</span>
                    </div>

                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="p-8 text-center border border-dashed border-[#333] rounded text-gray-500">
            NO UPCOMING MATCHES DETECTED FOR SELECTED GAMES.
            <br/><span className="text-xs">Checking: Valorant, PUBG Mobile, Free Fire</span>
          </div>
        )}
      </div>
    </main>
  );
}