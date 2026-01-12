"use client";
import { useState } from "react";
import { submitPredictionAction } from "@/app/actions";

export default function PredictionTerminal() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // REMOVED username: auth is handled server-side
    const res = await submitPredictionAction(text); 
    alert(res.verdict);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md space-y-2">
      <textarea 
        className="w-full bg-black border border-white/20 p-4 text-sm font-mono focus:border-[#ff4655] outline-none h-24"
        placeholder="Enter your tactical analysis..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button 
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-[#ff4655] p-3 uppercase font-black italic tracking-widest text-sm hover:bg-red-700 transition"
      >
        {loading ? "Analyzing..." : "Lock In Prediction"}
      </button>
    </div>
  );
}