"use client";

import { useState } from "react";
import { predictMatchAction } from "@/app/actions";

export default function MatchPrediction({ matchData }: { matchData: any }) {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    const res = await predictMatchAction(matchData);
    setPrediction(res);
    setLoading(false);
  };

  return (
    <div className="mt-8 p-6 border border-gray-800 bg-[#080808] rounded-lg text-center">
      <h3 className="text-xs text-red-500 uppercase tracking-widest font-bold mb-4">
        AI ORACLE PREDICTION
      </h3>

      {!prediction ? (
        <button
          onClick={handlePredict}
          disabled={loading}
          className="bg-white text-black hover:bg-gray-200 px-8 py-3 font-bold uppercase tracking-wider text-sm rounded transition-all disabled:opacity-50"
        >
          {loading ? "CALCULATING ODDS..." : "WHO WILL WIN?"}
        </button>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <div className="text-4xl font-black italic text-white mb-2">
            {prediction.winner}
          </div>
          <div className="text-xl font-mono text-red-500 mb-4">
            CONFIDENCE: {prediction.confidence}
          </div>
          <p className="text-gray-400 text-sm max-w-lg mx-auto italic">
            "{prediction.reason}"
          </p>
        </div>
      )}
    </div>
  );
}