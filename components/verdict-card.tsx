"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateDailyVerdict } from "@/actions/ai-judge";

interface VerdictData {
  narrative: string;
  mood: "IMPRESSED" | "NEUTRAL" | "WARNING" | "CRITICAL";
}

export function VerdictCard() {
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    // Prevent Hydration Mismatch for the time
    setTimestamp(new Date().toLocaleTimeString());

    async function fetchVerdict() {
      try {
        const result = await generateDailyVerdict();

        if (result.success && result.data) {
          setVerdict({
            narrative: result.data.narrative,
            mood: (result.data.mood as VerdictData["mood"]) || "NEUTRAL",
          });
        } else {
          setVerdict({ 
            narrative: result.error || "CONNECTION UNSTABLE. CHECK LOGS.", 
            mood: "WARNING" 
          });
        }
      } catch (error) {
        setVerdict({ 
          narrative: "SYSTEM CRITICAL FAILURE.", 
          mood: "CRITICAL" 
        });
      } finally {
        setLoading(false);
        setIsTyping(true); // Start typing animation when loading finishes
        
        // Stop cursor blinking after a delay
        setTimeout(() => setIsTyping(false), 4000);
      }
    }
    
    fetchVerdict();
  }, []);

  const moodStyles = {
    IMPRESSED: "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    NEUTRAL: "border-zinc-300 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]",
    WARNING: "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    CRITICAL: "border-red-500/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]",
  };

  const MoodIcon = {
    IMPRESSED: CheckCircle,
    NEUTRAL: Terminal,
    WARNING: Activity,
    CRITICAL: AlertTriangle,
  }[verdict?.mood || "NEUTRAL"];

  // Framer Motion variants for the typewriter effect
  const container = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }, // Super fast typing
    },
  };

  const letter = {
    hidden: { opacity: 0, display: "none" },
    visible: { opacity: 1, display: "inline" },
  };

  return (
    <div 
      className={cn(
        "relative h-full min-h-[16rem] flex flex-col justify-between p-6 border backdrop-blur-md transition-all duration-500 group",
        // Tactical Cut Corner Shape
        "[clip-path:polygon(0_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%)]",
        loading ? "border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-zinc-400" : moodStyles[verdict?.mood || "NEUTRAL"]
      )}
    >
      {/* Top Border Decor */}
      <div className="absolute top-0 left-0 w-full h-[2px] flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
         <div className={cn(
           "h-full w-8 bg-current opacity-50", 
           verdict?.mood === "CRITICAL" && "animate-pulse shadow-[0_0_10px_currentColor]"
          )} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between uppercase tracking-widest text-[11px] font-bold mb-4 relative z-10">
        <span className="flex items-center gap-2 drop-shadow-[0_0_8px_currentColor]">
          <MoodIcon className={cn("w-4 h-4", loading ? "animate-spin" : verdict?.mood === "CRITICAL" ? "animate-pulse" : "")} />
          // GIGA_JUDGE_AI
        </span>
        <span className={cn(loading && "animate-pulse")}>
          {loading ? "ANALYZING..." : verdict?.mood}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-grow flex items-center justify-center text-center px-4 relative z-10">
        {loading ? (
          <div className="space-y-3 w-full max-w-md opacity-50">
            <div className="h-1.5 bg-current rounded animate-pulse w-3/4 mx-auto" />
            <div className="h-1.5 bg-current rounded animate-pulse w-1/2 mx-auto" />
          </div>
        ) : (
          <motion.h2 
            variants={container}
            initial="hidden"
            animate="visible"
            className="text-2xl md:text-3xl font-black uppercase tracking-tighter"
          >
            "
            {verdict?.narrative.split("").map((char, index) => (
              <motion.span key={index} variants={letter}>
                {char}
              </motion.span>
            ))}
            "
            {isTyping && (
              <motion.span 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-3 h-6 bg-current ml-2 align-middle shadow-[0_0_5px_currentColor]"
              />
            )}
          </motion.h2>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-current/20 text-[9px] font-mono opacity-70 uppercase flex justify-between relative z-10">
        <span>ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
        <span>UPDATED: {loading ? "--:--:--" : timestamp}</span>
      </div>

      {/* Corner Accent */}
      <div className="absolute bottom-0 right-0 w-3 h-[1px] -rotate-45 origin-bottom-right translate-y-[-4px] translate-x-[-4px] bg-current opacity-50" />
    </div>
  );
}