"use client";

import { useEffect, useState } from "react";
import { Trophy, Zap, TrendingUp, Activity } from "lucide-react";
import { getDashboardData } from "@/actions/get-dashboard-data";
import { cn } from "@/lib/utils";
import { GigaCard } from "@/components/ui/giga-card";

// 1. We keep the TypeScript interface so Vercel doesn't crash during build
interface ScoreCardProps {
  score?: number;
  streak?: number;
  bestStreak?: number;
  accuracy?: number;
  rank?: string;
}

export function ScoreCard({ 
  score: propScore, 
  streak: propStreak, 
  bestStreak: propBestStreak, 
  accuracy: propAccuracy,
  rank: propRank 
}: ScoreCardProps) {
  
  // 2. Check if props were passed (meaning it's on the GigaScore page)
  const isPropProvided = propScore !== undefined;

  const [data, setData] = useState({ 
    score: propScore || 0, 
    streak: propStreak || 0, 
    bestStreak: propBestStreak || 0,
    accuracy: propAccuracy || 0,
    rank: propRank || "LOADING..." 
  });
  
  const [loading, setLoading] = useState(!isPropProvided);

  useEffect(() => {
    // If it received props, just use them and skip fetching
    if (isPropProvided) {
      setData({
        score: propScore || 0,
        streak: propStreak || 0,
        bestStreak: propBestStreak || 0,
        accuracy: propAccuracy || 0,
        rank: propRank || (propScore >= 500 ? "GIGA" : "OPERATIVE") // Fallback rank based on score
      });
      setLoading(false);
      return;
    }

    // If no props (Dashboard page), fetch the data internally
    async function load() {
      const res = await getDashboardData();
      if (res.success && res.data) {
        setData(prev => ({ ...prev, ...res.data }));
      }
      setLoading(false);
    }
    load();
  }, [isPropProvided, propScore, propStreak, propBestStreak, propAccuracy, propRank]);

  return (
    <GigaCard label="// GIGASCORE_IDENTITY" className="h-full min-h-[16rem] group flex flex-col justify-between overflow-hidden relative">
      
      {/* Background Decor - Lighter in Light Mode */}
      <div className="absolute -right-12 -top-12 text-zinc-200 dark:text-zinc-800/20 group-hover:text-zinc-300 dark:group-hover:text-zinc-800/30 transition-all duration-500 pointer-events-none">
        <Trophy size={180} strokeWidth={0.5} />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between pt-4">
        
        {/* Top Section */}
        <div className="flex items-end gap-4 mt-2">
          {/* TEXT COLOR FIX: Zinc-900 (Black) in Light, Zinc-100 (White) in Dark */}
          <span className="text-7xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 leading-none">
            {loading ? (
              <span className="animate-pulse text-zinc-300 dark:text-zinc-800">000</span>
            ) : (
              <CountUp to={data.score} />
            )}
          </span>
          
          <div className="mb-4 flex flex-col">
             <span className={cn(
               "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
               data.rank === "GIGA" 
                 ? "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/20" 
                 : "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"
             )}>
                {data.rank}
             </span>
          </div>
        </div>

        <div className="w-full h-[1px] bg-zinc-200 dark:bg-zinc-800 my-4" />

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
           {/* Stat 1: Streak */}
           <div>
              <div className="flex items-center gap-1 text-zinc-400 mb-1">
                 <Zap className="w-3 h-3" />
                 <span className="text-[9px] font-bold uppercase tracking-widest">Streak</span>
              </div>
              <div className="text-lg font-black text-zinc-700 dark:text-zinc-200">
                 {data.streak}
              </div>
           </div>
           
           {/* Stat 2: Best Streak */}
           <div>
              <div className="flex items-center gap-1 text-zinc-400 mb-1">
                 <TrendingUp className="w-3 h-3" />
                 <span className="text-[9px] font-bold uppercase tracking-widest">Best</span>
              </div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-500">
                 {data.bestStreak > 0 ? `+${data.bestStreak}` : data.bestStreak}
              </div>
           </div>
           
           {/* Stat 3: Accuracy */}
           <div>
              <div className="flex items-center gap-1 text-zinc-400 mb-1">
                 <Activity className="w-3 h-3" />
                 <span className="text-[9px] font-bold uppercase tracking-widest">Acc</span>
              </div>
              <div className="text-lg font-black text-zinc-400 dark:text-zinc-500">
                {data.accuracy > 0 ? `${Math.round(data.accuracy)}%` : '--'}
              </div>
           </div>
        </div>
      </div>
    </GigaCard>
  );
}

// ... CountUp helper stays exactly the same ...
function CountUp({ to }: { to: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = to / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) { setCount(to); clearInterval(timer); } 
      else { setCount(Math.floor(start)); }
    }, stepTime);
    return () => clearInterval(timer);
  }, [to]);
  return <>{count}</>;
}