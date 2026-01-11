"use client";

import { useState } from "react";
import { judgeFlashAction } from "@/app/actions";

// Now we accept 'scenarioData' as a prop
export default function FlashDecisions({ 
  username, 
  scenarioData 
}: { 
  username: string, 
  scenarioData: any 
}) {
  const [loading, setLoading] = useState(false);

  // If the admin hasn't created a scenario yet, show a waiting screen
  if (!scenarioData) {
    return (
      <div className="w-full max-w-md mt-8 p-6 border border-gray-800 rounded bg-[#050505] text-center">
        <div className="animate-pulse text-red-500 text-xs tracking-[0.2em] mb-2">LIVE FEED STANDBY</div>
        <p className="text-gray-500 text-sm">Waiting for match event...</p>
      </div>
    );
  }

  const handleChoice = async (choice: string) => {
    setLoading(true);
    await judgeFlashAction(username, scenarioData.title, choice);
    setLoading(false);
    // In a real app, we'd mark this as "done" locally, but for now we just show loading
  };

  return (
    <div className="w-full max-w-md mt-8">
      <div className="bg-[#111] border border-gray-800 p-6 rounded-lg text-center relative overflow-hidden">
        
        <h3 className="text-[10px] text-red-500 tracking-[0.3em] uppercase mb-4 font-bold animate-pulse">
          🔴 LIVE MATCH EVENT
        </h3>
        
        <h2 className="text-xl text-white font-light italic mb-8">
          "{scenarioData.title}"
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            disabled={loading}
            onClick={() => handleChoice(scenarioData.optionA)}
            className="p-4 bg-[#050505] border border-gray-700 hover:border-red-600 hover:bg-red-900/20 rounded transition-all group"
          >
            <div className="text-xs text-gray-500 mb-1">OPTION A</div>
            <div className="text-sm font-bold">{scenarioData.optionA}</div>
          </button>

          <button
            disabled={loading}
            onClick={() => handleChoice(scenarioData.optionB)}
            className="p-4 bg-[#050505] border border-gray-700 hover:border-blue-600 hover:bg-blue-900/20 rounded transition-all group"
          >
            <div className="text-xs text-gray-500 mb-1">OPTION B</div>
            <div className="text-sm font-bold">{scenarioData.optionB}</div>
          </button>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
            <span className="text-red-500 text-xs tracking-widest animate-pulse">
              ANALYZING TACTICS...
            </span>
          </div>
        )}

      </div>
    </div>
  );
}