"use client";

import { useState } from "react";
import { submitPredictionAction } from "@/app/actions";

export default function PredictionTerminal({ username }: { username: string }) {
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{iq: number, points: number} | null>(null);

  const handleSubmit = async () => {
    if (!prediction.trim()) return;
    setLoading(true);
    
    const result = await submitPredictionAction(username, prediction);
    if (result.success) {
      setLastResult({ iq: result.iq!, points: result.points! });
      setPrediction(""); // Clear input
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md p-6 bg-[#050505] border border-gray-800 rounded-lg mt-8 relative overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs text-gray-500 uppercase tracking-widest">Prediction Engine</h3>
        {lastResult && (
          <span className={`text-xs font-mono ${lastResult.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
            LAST: {lastResult.points > 0 ? '+' : ''}{lastResult.points} PTS (IQ: {lastResult.iq})
          </span>
        )}
      </div>
      
      {/* INPUT AREA */}
      <textarea 
        className="w-full bg-[#111] text-white p-4 rounded border border-gray-700 text-sm focus:border-red-600 outline-none font-mono resize-none h-24"
        placeholder="Type your hot take... (e.g. 'GodLike will drop Pochinki and wipe Soul')"
        value={prediction}
        onChange={(e) => setPrediction(e.target.value)}
        disabled={loading}
      />

      {/* ANALYZE BUTTON */}
      <button
        onClick={handleSubmit}
        disabled={loading || !prediction}
        className="w-full mt-4 py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-[0.2em] text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "CALCULATING GIGA-IQ..." : "JUDGE MY TAKE"}
      </button>

      <div className="text-[9px] text-gray-600 mt-2 text-center font-mono">
        HIGH IQ = REWARD // LOW IQ = PENALTY
      </div>
    </div>
  );
}