"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Play, Settings2, ShieldAlert, Trophy, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

// --- GIGASCORE MATH ENGINE ---
const runSimulation = (winRate: number) => {
  const data = [];
  const stats = {
    P1: { score: 500, streak: 0, inactive: 0, maxStreak: 0, predictions: 0, decays: 0 },
    P2: { score: 500, streak: 0, inactive: 0, maxStreak: 0, predictions: 0, decays: 0 },
    P3: { score: 500, streak: 0, inactive: 0, maxStreak: 0, predictions: 0, decays: 0 }
  };

  for (let day = 1; day <= 30; day++) {
    const dailyData: any = { day: `Day ${day}` };

    // Define interaction schedules (1-indexed days)
    // P1: Every day | P2: Tue(2), Thu(4), Sat(6) | P3: Sat(6)
    const schedules = {
      P1: true, 
      P2: day % 7 === 2 || day % 7 === 4 || day % 7 === 6,
      P3: day % 7 === 6
    };

    (['P1', 'P2', 'P3'] as const).forEach(player => {
      const p = stats[player];
      
      if (schedules[player]) {
        // Interaction Day
        p.predictions++;
        p.inactive = 0;
        const isWin = Math.random() < (winRate / 100);
        
        if (isWin) {
          // Win: Base 15 + Streak Multiplier (5% per streak day)
          const pointsEarned = 15 * (1 + (p.streak * 0.05));
          p.score += pointsEarned;
          p.streak++;
          if (p.streak > p.maxStreak) p.maxStreak = p.streak;
        } else {
          // Loss: Base -10, Streak reset
          p.score -= 10;
          p.streak = 0;
        }
      } else {
        // Non-Interaction Day
        p.streak = 0;
        p.inactive++;
        
        // Decay Penalty Rule: > 3 days inactive
        if (p.inactive > 3) {
          p.score -= 5;
          p.decays++;
        }
      }
      
      dailyData[player] = Math.round(p.score);
    });

    data.push(dailyData);
  }

  return { chartData: data, finalStats: stats };
};

export default function SimulationPage() {
  const [winRate, setWinRate] = useState(50);
  const [simulationId, setSimulationId] = useState(0); // Used to trigger re-renders

  // Memoize the simulation so it only re-runs when the button is clicked
  const { chartData, finalStats } = useMemo(
    () => runSimulation(winRate), 
    [simulationId] // Notice we don't put winRate here, so sliding it doesn't auto-run
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-red-600 selection:text-white">
      <Navbar />
      
      <main className="container mx-auto max-w-[1200px] p-6 mt-4 space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
          <div>
            <h1 className="flex items-center gap-3 font-black uppercase tracking-tighter text-4xl md:text-5xl italic leading-[0.85]">
              <Settings2 className="w-10 h-10 text-red-600" />
              Algorithm <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 pr-2">Engine</span>
            </h1>
            <p className="mt-2 font-bold uppercase text-[10px] tracking-widest text-zinc-400">
              // GIGASCORE_MATHEMATICAL_MODEL // 30_DAY_SIMULATION
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full max-w-md">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Global Win Rate Probability
              </label>
              <span className="font-mono text-emerald-500 font-bold">{winRate}%</span>
            </div>
            <input 
              type="range" 
              min="30" max="80" step="5"
              value={winRate}
              onChange={(e) => setWinRate(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <p className="text-[10px] text-zinc-600 font-mono mt-2 uppercase">
              // Adjust probability to see how behavior overrides raw luck
            </p>
          </div>

          <button 
            onClick={() => setSimulationId(prev => prev + 1)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest px-8 py-4 rounded-sm transition-colors"
          >
            <Play className="w-4 h-4 fill-current" /> Initialize Run
          </button>
        </div>

        {/* The Graph */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-sm h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="day" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" dy={10} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" domain={['dataMin - 50', 'dataMax + 50']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5', fontFamily: 'monospace', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px', paddingTop: '20px' }} />
              
              <Line name="P1: The Regular (Daily)" type="monotone" dataKey="P1" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line name="P2: The Rookie (3x/Week)" type="monotone" dataKey="P2" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line name="P3: The Casual (1x/Week)" type="monotone" dataKey="P3" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* The Summary Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'P1', name: 'The Regular', desc: 'Predicts Daily', color: 'text-emerald-500', border: 'border-emerald-500/30' },
            { id: 'P2', name: 'The Rookie', desc: 'Predicts 3x a Week', color: 'text-blue-500', border: 'border-blue-500/30' },
            { id: 'P3', name: 'The Casual', desc: 'Predicts 1x a Week', color: 'text-red-500', border: 'border-red-500/30' }
          ].map((profile) => {
            const s = finalStats[profile.id as keyof typeof finalStats];
            return (
              <div key={profile.id} className={cn("bg-zinc-900/60 border p-6 rounded-sm", profile.border)}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className={cn("font-black uppercase italic text-2xl tracking-tighter", profile.color)}>
                      {profile.name}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{profile.desc}</p>
                  </div>
                  <span className="font-mono text-2xl font-bold text-white">{Math.round(s.score)}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Operations Completed</span>
                    <span className="font-mono font-bold text-white">{s.predictions}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Max Streak
                    </span>
                    <span className="font-mono font-bold text-white">{s.maxStreak}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Decay Penalties
                    </span>
                    <span className={cn("font-mono font-bold", s.decays > 0 ? "text-red-500" : "text-emerald-500")}>
                      {s.decays}
                    </span>
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