import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Activity, ShieldAlert, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { syncUser } from "@/actions/auth";

// Components
import { Navbar } from "@/components/navbar";
import { ScoreCard } from "@/components/score-card"; 
import { VerdictCard } from "@/components/verdict-card"; 
import { PredictionCard } from "@/components/ui/prediction-card";
import { IdentityGraph } from "@/components/ui/identity-graph";

export default async function GigaScorePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  // 1. QUERY: Fetches user and their newly updated Prediction records
  const user = await db.user.findUnique({
    where: { clerkId },
    include: {
      predictions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      scoreHistory: {
        orderBy: { timestamp: "asc" },
        take: 20,
      },
      dailyVerdicts: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    await syncUser();
    // Refresh the page or just re-fetch
    return redirect("/gigascore");
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-sm tracking-widest animate-pulse">
        // INITIALIZING OPERATIVE PROFILE...
      </div>
    );
  }

  const latestVerdict = user.dailyVerdicts[0];
  const graphData = user.scoreHistory.map((log) => ({
    date: log.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: log.newScore,
  }));

  // Check if today's ritual is complete
  const today = new Date();
  const verdictDate = latestVerdict ? new Date(latestVerdict.date) : null;
  const isRitualComplete = verdictDate && 
    verdictDate.getDate() === today.getDate() && 
    verdictDate.getMonth() === today.getMonth() && 
    verdictDate.getFullYear() === today.getFullYear();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-red-600 selection:text-white">
      <Navbar />
      
      <main className="container mx-auto max-w-[1400px] p-6 mt-4 space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
          <div>
            <h1 className="flex items-center gap-3 font-black uppercase tracking-tighter text-4xl md:text-5xl italic leading-[0.85]">
              <Activity className="w-10 h-10 text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
              Giga<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 pr-2">Score</span>
            </h1>
            <p className="mt-2 font-bold uppercase text-[10px] tracking-widest text-zinc-400">
              // IDENTITY_PROTOCOL // REPUTATION_TIER: {user.reputationTier}
            </p>
          </div>
        </div>

        {/* TOP STATS ROW */}
        <section>
          <ScoreCard 
            score={Math.floor(user.gigaScore)}
            streak={user.currentStreak}
            bestStreak={user.bestStreak}
            accuracy={user.accuracyRate}
          />
        </section>

        {/* MIDDLE GRID: RITUAL, VERDICT, & GRAPH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <aside className="lg:col-span-4 space-y-8 h-full flex flex-col">
            {/* Daily Ritual Status */}
            <div className="p-5 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-sm">
              <h4 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">
                // Daily_Ritual_Status
              </h4>
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-sm border font-bold uppercase text-xs tracking-widest transition-colors",
                isRitualComplete 
                  ? "bg-emerald-900/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                  : "bg-red-900/10 border-red-500/30 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
              )}>
                {isRitualComplete ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    TODAY&apos;S RITUAL COMPLETE
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 animate-pulse" />
                    PENDING DAILY JUDGMENT
                  </>
                )}
              </div>
            </div>
            
            {/* The Verdict Card */}
            <div className="flex-grow">
              <VerdictCard />
            </div>
          </aside>

          {/* Identity Graph Area */}
          <div className="lg:col-span-8 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-sm p-6 min-h-[300px] flex flex-col">
            <h4 className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest flex items-center justify-between">
              <span>// Behavioral_Trajectory</span>
              <span className="text-zinc-600 flex items-center gap-2"><Activity className="w-3 h-3"/> LIFETIME</span>
            </h4>
            <div className="flex-grow w-full">
               <IdentityGraph data={graphData} />
            </div>
          </div>
        </div>

        {/* MISSION HISTORY (Predictions) */}
        <section className="pt-4">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h2 className="font-black uppercase text-xl italic tracking-tighter">
              Mission <span className="text-red-600">History</span>
            </h2>
            <span className="font-mono text-[10px] text-zinc-500 uppercase ml-auto">
              // RECENT_OPERATIONS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.predictions.length > 0 ? (
              user.predictions.map((prediction) => (
                <PredictionCard 
                  key={prediction.id} 
                  prediction={{
                    pick: prediction.pick,
                    outcome: prediction.outcome as any
                  }} 
                  // UPDATED: Now pulling actual team and tournament data directly from your DB!
                  match={{
                    teamA: prediction.teamA || prediction.pick, // Fallback to pick if old data
                    teamB: prediction.teamB || "TBD",
                    tournName: prediction.tournName || "PRO EVENT",
                    game: prediction.game || "ESPORTS"
                  }} 
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-sm text-zinc-500 font-mono text-[10px] uppercase tracking-widest bg-zinc-950/20">
                <ShieldCheck className="w-8 h-8 mx-auto mb-3 opacity-50" />
                // NO PREDICTIVE DATA FOUND IN MEMORY. INITIATE PROTOCOLS.
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}