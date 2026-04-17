"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitPrediction } from "@/actions/submit-prediction";
import { CheckCircle2 } from "lucide-react";

interface PredictionButtonsProps {
  matchId: string;
  teamA: string;
  teamB: string;
  gameName: string;
  tournName: string; // <--- 1. ADDED TOURNAMENT PROP
  initialPick?: string | null; 
}

export function PredictionButtons({ matchId, teamA, teamB, gameName, tournName, initialPick }: PredictionButtonsProps) {
  const [lockedPick, setLockedPick] = useState<string | null>(initialPick || null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (pick: string) => {
    setLoading(true);
    
    // 2. PASSED ALL THE NEW DATA TO THE SERVER ACTION
    const result = await submitPrediction(matchId, pick, gameName, teamA, teamB, tournName);
    
    if (result.success) {
      setLockedPick(pick);
    } else {
      alert(result.error); 
    }
    setLoading(false);
  };

  if (lockedPick) {
    return (
      <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded border border-emerald-500/20 w-full justify-center">
        <CheckCircle2 className="w-4 h-4" />
        <span className="font-bold uppercase text-[10px] tracking-widest">
          INTEL LOCKED: {lockedPick}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full mt-4 md:mt-0">
      <Button 
        variant="outline" 
        className="w-full text-[10px] tracking-widest font-bold uppercase hover:border-red-500 hover:text-red-500"
        onClick={() => handlePredict(teamA)}
        disabled={loading}
      >
        PICK {teamA}
      </Button>
      <Button 
        variant="outline" 
        className="w-full text-[10px] tracking-widest font-bold uppercase hover:border-red-500 hover:text-red-500"
        onClick={() => handlePredict(teamB)}
        disabled={loading}
      >
        PICK {teamB}
      </Button>
    </div>
  );
}