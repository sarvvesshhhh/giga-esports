"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { VerdictCard } from "@/components/verdict-card";
import { ScoreCard } from "@/components/score-card";
import { GigaCard } from "@/components/ui/giga-card";
import { Play, TrendingDown, Target, AlertCircle, Crosshair, ShieldCheck, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLiveMatches } from "@/actions/esports-data";
import { getDashboardData } from "@/actions/get-dashboard-data";

// Framer Motion Variants for Staggered Logs
const logContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const logItem = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 }
};

export default function DashboardPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchData() {
      const liveData = await getLiveMatches();
      setMatches(liveData);
      const dashData = await getDashboardData();
      if (dashData.success && dashData.data?.logs) {
        setLogs(dashData.data.logs);
      }
    }
    fetchData();
  }, []);

  // Helper to assign a specific icon based on log event type
  const getLogIcon = (eventStr: string) => {
    const lower = eventStr.toLowerCase();
    if (lower.includes('auth') || lower.includes('login')) return <ShieldCheck className="w-3 h-3 text-zinc-500" />;
    if (lower.includes('predict') || lower.includes('pick')) return <Crosshair className="w-3 h-3 text-red-500" />;
    return <Activity className="w-3 h-3 text-zinc-500" />;
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 font-sans selection:bg-red-600 selection:text-white">
      <Navbar />

      <main className="container mx-auto max-w-[1400px] p-6 space-y-8 mt-4">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
          <div>
            <h1 className="font-black uppercase tracking-tighter text-4xl md:text-5xl italic leading-[0.85]">
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">Center`</span>
            </h1>
            <p className="mt-2 font-bold uppercase text-[10px] tracking-widest text-zinc-400">
              // System_Ver_2.0 // Identity_Protocol_Active
            </p>
          </div>
        </div>

        {/* LIVE MATCH RAIL */}
        <section>
          <div className="flex items-center gap-2 mb-4">
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
               </span>
               <span className="font-bold uppercase text-[9px] text-red-600 tracking-widest drop-shadow-[0_0_5px_rgba(220,38,38,0.4)]">
                  LIVE OPERATIONS
               </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matches.length > 0 ? (
              matches.map((match) => (
                <GigaCard 
                  key={match.id} 
                  className="group cursor-pointer hover:border-red-600/50 transition-colors overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-950/10 via-transparent to-transparent"
                >
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold uppercase text-[9px] px-2 py-1 tracking-wider border border-red-500/20 backdrop-blur-sm">
                      {match.videogame.name}
                    </span>
                    <span className="font-bold uppercase text-[9px] text-zinc-400 tracking-widest animate-pulse">
                      ● LIVE
                    </span>
                  </div>
                  
                  {/* Enhanced Matchup View with Logos */}
                  <div className="flex justify-between items-center text-xl font-black italic tracking-tighter mb-2 relative z-10 w-full">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {match.opponents[0]?.opponent.image_url && (
                         <img src={match.opponents[0].opponent.image_url} alt="Team A" className="w-6 h-6 shrink-0 object-contain drop-shadow-lg" />
                      )}
                      <span className="truncate">{match.opponents[0]?.opponent.acronym || "TBD"}</span>
                    </div>
                    
                    <span className="text-red-600 text-sm opacity-80 shrink-0 px-3">VS</span>
                    
                    <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                      <span className="truncate text-right">{match.opponents[1]?.opponent.acronym || "TBD"}</span>
                      {match.opponents[1]?.opponent.image_url && (
                         <img src={match.opponents[1].opponent.image_url} alt="Team B" className="w-6 h-6 shrink-0 object-contain drop-shadow-lg" />
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 text-center relative z-10">
                     <a href={match.official_stream_url} target="_blank" className="flex items-center justify-center gap-2 font-bold uppercase text-[10px] tracking-widest text-red-600 group-hover:text-red-400 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all">
                        <Play className="w-3 h-3 fill-current" /> WATCH STREAM
                     </a>
                  </div>
                </GigaCard>
              ))
            ) : (
              <div className="col-span-3 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-sm flex flex-col items-center justify-center p-8 text-zinc-400 backdrop-blur-sm bg-zinc-950/20">
                 <AlertCircle className="w-6 h-6 mb-2 opacity-50" />
                 <span className="font-bold uppercase text-[10px] tracking-widest">No Active Feeds Detected</span>
                 <span className="font-mono text-[9px] opacity-50 mt-1">// CHECK PANDASCORE_API_KEY OR TRY AGAIN LATER</span>
              </div>
            )}
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 h-full">
             <ScoreCard /> 
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-5 h-full">
              <VerdictCard />
          </motion.div>

          {/* Staggered System Logs */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
             <GigaCard label="// SYSTEM_LOGS" className="h-full min-h-[16rem]">
                <motion.div 
                  variants={logContainer} 
                  initial="hidden" 
                  animate="show" 
                  className="space-y-4 mt-2"
                >
                   {logs.length > 0 ? logs.map((log) => (
                     <motion.div key={log.id} variants={logItem} className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/50 pb-3 last:border-0 group">
                        <div className="flex items-start gap-3">
                           <div className="mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                             {getLogIcon(log.event)}
                           </div>
                           <div className="flex flex-col">
                              <span className="font-bold uppercase text-[10px] text-zinc-500 dark:text-zinc-400 tracking-wide group-hover:text-zinc-200 transition-colors">
                                 {log.event}
                              </span>
                              <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-600">
                                 {new Date(log.time).toLocaleTimeString()}
                              </span>
                           </div>
                        </div>
                        {log.delta !== 0 && (
                          <div className={cn("flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded backdrop-blur-sm", log.type === "loss" ? "text-red-500 bg-red-500/10" : "text-emerald-500 bg-emerald-500/10")}>
                             {log.type === "loss" ? <TrendingDown className="w-3 h-3"/> : <Target className="w-3 h-3"/>}
                             {log.type === "win" ? "+" : ""}{log.delta}
                          </div>
                        )}
                     </motion.div>
                   )) : (
                     <div className="text-center pt-8 text-zinc-500 font-mono text-[10px]">
                        // NO RECENT ACTIVITY
                     </div>
                   )}
                </motion.div>
             </GigaCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
}