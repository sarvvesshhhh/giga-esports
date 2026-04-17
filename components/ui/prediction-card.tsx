import { CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionCardProps {
  prediction: {
    pick: string;
    outcome: "CORRECT" | "INCORRECT" | "PENDING" | "VOID" | null;
  };
  match: {
    teamA: string;
    teamB: string;
    tournName: string;
    game: string;
  };
}

export function PredictionCard({ prediction, match }: PredictionCardProps) {
  const isCorrect = prediction.outcome === "CORRECT";
  const isPending = prediction.outcome === "PENDING";
  const isMiss = prediction.outcome === "INCORRECT";

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-lg p-5 group hover:border-zinc-600 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {isPending && <Clock className="w-3 h-3 text-zinc-500 animate-pulse" />}
          {isCorrect && <CheckCircle2 className="w-3 h-3 text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />}
          {isMiss && <XCircle className="w-3 h-3 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />}
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">
            {match.game} // {match.tournName}
          </span>
        </div>
        
        {/* Points Display */}
        <span className={cn(
          "text-[10px] font-black px-2 py-0.5 rounded uppercase border backdrop-blur-sm",
          isCorrect ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : 
          isMiss ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : 
          "bg-zinc-800/50 text-zinc-400 border-zinc-700"
        )}>
          {isCorrect ? "+28 PTS" : isMiss ? "MISS" : "PENDING"}
        </span>
      </div>

      {/* Matchup View */}
      <div className="flex justify-between items-center font-black italic tracking-tighter text-lg mb-4 text-white uppercase">
        <span className={cn("transition-colors duration-300", prediction.pick === match.teamA ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "opacity-80")}>
          {match.teamA}
        </span>
        <span className="text-[10px] text-zinc-600 not-italic tracking-normal px-2">VS</span>
        <span className={cn("transition-colors duration-300", prediction.pick === match.teamB ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "opacity-80")}>
          {match.teamB}
        </span>
      </div>

      {/* Identity Summary Box */}
      <div className="bg-black/40 backdrop-blur-sm border border-zinc-800/50 rounded p-3 space-y-3 group-hover:border-zinc-700/50 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[9px] font-mono uppercase tracking-tighter group-hover:text-zinc-400 transition-colors">Your Intelligence:</span>
          </div>
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(239,68,68,0.3)]">
            {prediction.pick}
          </span>
        </div>

        {/* Tactical Confidence Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] font-mono text-zinc-600 uppercase">
            <span>Confidence Indicator</span>
            <span>85%</span>
          </div>
          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className={cn("h-full transition-all duration-1000", isCorrect ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]")} 
              style={{ width: '85%' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}