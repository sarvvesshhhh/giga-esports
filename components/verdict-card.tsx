"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateDailyVerdict } from "@/actions/ai-judge";

// Define the shape of our data
interface VerdictData {
  narrative: string;
  mood: "IMPRESSED" | "NEUTRAL" | "WARNING" | "CRITICAL";
}

export function VerdictCard() {
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVerdict() {
      try {
        const result = await generateDailyVerdict();

        // LOGGING FOR DEBUGGING
        console.log("AI Judge Result:", result);

        if (result.success && result.data) {
          setVerdict({
            narrative: result.data.narrative,
            mood: (result.data.mood as VerdictData["mood"]) || "NEUTRAL",
          });
        } else {
          console.error("Backend Error:", result.error);
          setVerdict({ 
            narrative: result.error || "CONNECTION UNSTABLE. CHECK LOGS.", 
            mood: "WARNING" 
          });
        }
      } catch (error) {
        console.error("Failed to fetch verdict", error);
        setVerdict({ 
          narrative: "SYSTEM CRITICAL FAILURE.", 
          mood: "CRITICAL" 
        });
      } finally {
        setLoading(false);
      }
    }
    fetchVerdict();
  }, []);

  // Visual styles based on Mood - UPDATED FOR LIGHT/DARK MODE
  const moodStyles = {
    // Light: Green text/border/bg | Dark: Green Glow/Transparent
    IMPRESSED: "border-emerald-200 text-emerald-700 bg-emerald-50/50 dark:border-green-500/50 dark:text-green-400 dark:bg-transparent dark:shadow-[0_0_20px_rgba(34,197,94,0.2)]",
    
    // Light: Zinc text/border/bg | Dark: Zinc text/border
    NEUTRAL: "border-zinc-200 text-zinc-600 bg-zinc-50/50 dark:border-zinc-500/50 dark:text-zinc-400 dark:bg-transparent",
    
    // Light: Yellow text/border/bg | Dark: Yellow Glow
    WARNING: "border-yellow-200 text-yellow-700 bg-yellow-50/50 dark:border-yellow-500/50 dark:text-yellow-400 dark:bg-transparent dark:shadow-[0_0_20px_rgba(234,179,8,0.2)]",
    
    // Light: Red text/border/bg | Dark: Red Glow
    CRITICAL: "border-red-200 text-red-600 bg-red-50/50 dark:border-red-500/50 dark:text-red-500 dark:bg-transparent dark:shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse",
  };

  const MoodIcon = {
    IMPRESSED: CheckCircle,
    NEUTRAL: Terminal,
    WARNING: Activity,
    CRITICAL: AlertTriangle,
  }[verdict?.mood || "NEUTRAL"];

  return (
    <div className="w-full h-full min-h-[16rem] relative group">
      {/* Glitch Overlay - Only visible in Dark Mode */}
      <div className="absolute inset-0 bg-grid-zinc-900/50 [mask-image:linear-gradient(0deg,white,transparent)] dark:bg-grid-white/5 pointer-events-none opacity-0 dark:opacity-100 transition-opacity" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative h-full flex flex-col justify-between p-6 border-2 backdrop-blur-sm transition-all duration-500",
          // Base bg for light mode vs dark
          "bg-white/80 dark:bg-zinc-950/80",
          loading ? "border-zinc-200 dark:border-zinc-800" : moodStyles[verdict?.mood || "NEUTRAL"]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between uppercase tracking-widest text-xs font-mono mb-4">
          <span className="flex items-center gap-2">
            <MoodIcon className="w-4 h-4" />
            // Giga_Judge_AI
          </span>
          <span className={cn(loading && "animate-pulse")}>
            {loading ? "ANALYZING..." : verdict?.mood}
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-grow flex items-center justify-center text-center">
          {loading ? (
            <div className="space-y-2 w-full max-w-md">
              <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-3/4 mx-auto" />
              <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-1/2 mx-auto" />
            </div>
          ) : (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg md:text-2xl font-bold uppercase font-sans leading-tight"
            >
              &quot;{verdict?.narrative}&quot;
            </motion.p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-dashed border-zinc-300 dark:border-zinc-800 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex justify-between">
          <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          <span>UPDATED: {new Date().toLocaleTimeString()}</span>
        </div>
      </motion.div>
    </div>
  );
}