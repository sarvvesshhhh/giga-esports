"use client";
import { useState } from "react";
import { judgeFlashAction } from "@/app/actions";

export default function FlashDecisions({ scenario }: { scenario: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleChoice = async (choice: string) => {
    setLoading(true);
    // REMOVED username: The action handles auth internally
    const res = await judgeFlashAction(scenario, choice); 
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="bg-[#0f1923] border border-white/10 p-6 max-w-md w-full">
      <h3 className="text-[#ff4655] font-black uppercase italic mb-4">Flash Protocol</h3>
      <p className="text-gray-400 text-sm mb-6">"{scenario}"</p>
      
      {!result ? (
        <div className="grid grid-cols-2 gap-2">
          <button 
            disabled={loading}
            onClick={() => handleChoice("Aggressive")}
            className="bg-white/5 border border-white/10 p-3 hover:bg-[#ff4655] transition text-xs uppercase font-bold"
          >
            Push
          </button>
          <button 
            disabled={loading}
            onClick={() => handleChoice("Passive")}
            className="bg-white/5 border border-white/10 p-3 hover:bg-white hover:text-black transition text-xs uppercase font-bold"
          >
            Hold
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in">
          <p className="text-xs italic text-gray-500 mb-2">Verdict:</p>
          <p className="text-sm leading-relaxed text-white">"{result.verdict}"</p>
          <p className="mt-2 text-[#ff4655] font-black">{result.points > 0 ? `+${result.points}` : result.points} GigaScore</p>
        </div>
      )}
    </div>
  );
}