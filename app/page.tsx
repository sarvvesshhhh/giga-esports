"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { VerdictCard } from "@/components/verdict-card";
import { ScoreCard } from "@/components/score-card";
import { GigaCard } from "@/components/ui/giga-card";
import { Play, TrendingDown, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLiveMatches } from "@/actions/esports-data"; // Match fetcher
import { getDashboardData } from "@/actions/get-dashboard-data"; // Log fetcher

export default function DashboardPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Fetch Real Data on Mount
  useEffect(() => {
    async function fetchData() {
      // 1. Get Live Matches
      const liveData = await getLiveMatches();
      setMatches(liveData);

      // 2. Get User Logs
      const dashData = await getDashboardData();
      if (dashData.success && dashData.data?.logs) {
        setLogs(dashData.data.logs);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-red-600 selection:text-white">
      <Navbar />

      <main className="container mx-auto max-w-[1400px] p-6 space-y-8 mt-4">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
          <div>
            <h1 className="font-black uppercase tracking-tighter text-4xl md:text-5xl italic leading-[0.85]">
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Center`</span>
            </h1>
            <p className="mt-2 font-bold uppercase text-[10px] tracking-widest text-zinc-400">
              // System_Ver_2.0 // Identity_Protocol_Active
            </p>
          </div>
        </div>

        {/* LIVE MATCH RAIL (Real Data) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
               </span>
               <span className="font-bold uppercase text-[9px] text-red-600 tracking-widest">
                  LIVE OPERATIONS
               </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matches.length > 0 ? (
              matches.map((match) => (
                <GigaCard key={match.id} className="group cursor-pointer hover:border-red-600/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 font-bold uppercase text-[9px] px-2 py-1 tracking-wider">
                      {match.videogame.name}
                    </span>
                    <span className="font-bold uppercase text-[9px] text-zinc-400 tracking-widest animate-pulse">
                      ● LIVE
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-black italic tracking-tighter mb-2">
                    <span className="truncate max-w-[40%]">{match.opponents[0]?.opponent.acronym || "TBD"}</span>
                    <span className="text-red-600">VS</span>
                    <span className="truncate max-w-[40%] text-right">{match.opponents[1]?.opponent.acronym || "TBD"}</span>
                  </div>
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 text-center">
                     <a href={match.official_stream_url} target="_blank" className="flex items-center justify-center gap-2 font-bold uppercase text-[10px] tracking-widest text-red-600 group-hover:underline">
                        <Play className="w-3 h-3 fill-current" /> WATCH STREAM
                     </a>
                  </div>
                </GigaCard>
              ))
            ) : (
              // EMPTY STATE (If no matches found)
              <div className="col-span-3 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-sm flex flex-col items-center justify-center p-8 text-zinc-400">
                 <AlertCircle className="w-6 h-6 mb-2 opacity-50" />
                 <span className="font-bold uppercase text-[10px] tracking-widest">No Active Feeds Detected</span>
                 <span className="font-mono text-[9px] opacity-50 mt-1">// CHECK PANDASCORE_API_KEY OR TRY AGAIN LATER</span>
              </div>
            )}
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* GigaScore */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 h-full">
             <ScoreCard /> 
          </motion.div>

          {/* AI Judge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-5 h-full">
              <VerdictCard />
          </motion.div>

          {/* Real Logs */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
             <GigaCard label="// SYSTEM_LOGS" className="h-full min-h-[16rem]">
                <div className="space-y-4 mt-2">
                   {logs.length > 0 ? logs.map((log) => (
                     <div key={log.id} className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/50 pb-3 last:border-0">
                        <div className="flex flex-col">
                           <span className="font-bold uppercase text-[10px] text-zinc-500 dark:text-zinc-400 tracking-wide">
                              {log.event}
                           </span>
                           <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-600">
                              {new Date(log.time).toLocaleTimeString()}
                           </span>
                        </div>
                        {log.delta !== 0 && (
                          <div className={cn("flex items-center gap-1 font-mono text-xs font-bold", log.type === "loss" ? "text-red-500" : "text-emerald-500")}>
                             {log.type === "loss" ? <TrendingDown className="w-3 h-3"/> : <Target className="w-3 h-3"/>}
                             {log.type === "win" ? "+" : ""}{log.delta}
                          </div>
                        )}
                     </div>
                   )) : (
                     <div className="text-center pt-8 text-zinc-500 font-mono text-[10px]">
                        // NO RECENT ACTIVITY
                     </div>
                   )}
                </div>
             </GigaCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
}