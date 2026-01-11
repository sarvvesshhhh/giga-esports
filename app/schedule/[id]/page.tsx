import { getMatchDetails } from "@/lib/pandascore";
import Link from "next/link";
import MatchPrediction from "@/components/MatchPrediction";

export const dynamic = "force-dynamic";

// 1. Change the type to Promise
export default async function MatchRoom({ params }: { params: Promise<{ id: string }> }) {
  
  // 2. AWAIT THE PARAMS (Critical Fix for Next.js 15)
  const { id } = await params; 

  // 3. Fetch using the extracted ID
  const match = await getMatchDetails(id);

  if (!match) return <div className="text-white p-10 font-mono text-red-500">ERROR: MATCH NOT FOUND ({id})</div>;

  const teamA = match.opponents[0]?.opponent;
  const teamB = match.opponents[1]?.opponent;
  
  // Format Time for India (IST)
  const istTime = new Date(match.begin_at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Extract Stream Channel
  const streamUrl = match.official_stream_url;
  let streamChannel = "";
  let isTwitch = false;

  if (streamUrl && streamUrl.includes("twitch.tv")) {
    streamChannel = streamUrl.split("twitch.tv/")[1]?.split("/")[0];
    isTwitch = true;
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-20">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center gap-2 text-gray-500 text-xs font-mono uppercase">
        <Link href="/schedule" className="hover:text-red-500">← BACK TO SCHEDULE</Link>
        <span>/</span>
        <span>{match.league.name}</span>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: STREAM & PREDICTION */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* VIDEO PLAYER */}
          <div className="aspect-video w-full bg-[#050505] border border-gray-800 rounded-lg overflow-hidden relative group">
            {match.status === "running" && (
                <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-2 py-1 text-[10px] font-bold uppercase rounded animate-pulse">
                    LIVE NOW
                </div>
            )}
            
            {isTwitch && streamChannel ? (
              <iframe
                src={`https://player.twitch.tv/?channel=${streamChannel}&parent=gigaesports.in&parent=localhost&parent=giga-esports.vercel.app`}
                height="100%"
                width="100%"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                  <div className="text-4xl">📺</div>
                  <div className="text-sm uppercase tracking-widest">
                    {match.status === "not_started" ? "Stream Offline" : "Stream Link External"}
                  </div>
                  {streamUrl && (
                    <a href={streamUrl} target="_blank" className="bg-red-900/20 text-red-500 px-4 py-2 rounded text-xs hover:bg-red-900 hover:text-white transition">
                        OPEN STREAM ↗
                    </a>
                  )}
               </div>
            )}
          </div>

          {/* AI PREDICTION */}
          <MatchPrediction matchData={match} />
        </div>

        {/* RIGHT COLUMN: STATS */}
        <div className="space-y-6">
            
            {/* SCOREBOARD */}
            <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded-lg text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                    {istTime} (IST)
                </div>
                
                <div className="flex justify-between items-center mb-6">
                    {/* Team A */}
                    <div className="flex flex-col items-center gap-2 w-1/3">
                        {teamA?.image_url && <img src={teamA.image_url} className="w-12 h-12 object-contain"/>}
                        <span className="font-bold text-sm">{teamA?.acronym || teamA?.name || "TBD"}</span>
                    </div>

                    <div className="text-2xl font-black italic text-red-600">VS</div>

                    {/* Team B */}
                    <div className="flex flex-col items-center gap-2 w-1/3">
                        {teamB?.image_url && <img src={teamB.image_url} className="w-12 h-12 object-contain"/>}
                        <span className="font-bold text-sm">{teamB?.acronym || teamB?.name || "TBD"}</span>
                    </div>
                </div>

                <div className="w-full h-px bg-[#222] my-4"></div>

                <div className="flex justify-between text-xs text-gray-400 uppercase">
                    <span>Format</span>
                    <span className="text-white font-bold">Best of {match.number_of_games}</span>
                </div>
            </div>

            {/* ROSTER PLACEHOLDER */}
            <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded-lg">
                <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-bold">
                    EXPECTED LINEUP
                </h3>
                <div className="text-center text-[10px] text-gray-600 italic">
                    Lineup data pending for this match ID.
                </div>
            </div>

        </div>

      </div>
    </main>
  );
}