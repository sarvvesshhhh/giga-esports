"use client";

import { useState } from "react";
import { roastUserAction } from "@/app/actions";

export default function RoastButton({ username }: { username: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    // Call the server action we just made
    await roastUserAction(username);
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-8 px-8 py-3 bg-red-900/20 border border-red-900 text-red-500 font-mono text-xs uppercase tracking-[0.2em] hover:bg-red-900 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      {loading ? (
        <span className="animate-pulse">Analyzing Fails...</span>
      ) : (
        <span className="group-hover:tracking-[0.4em] transition-all">
          Request Judgment (-50 Pts)
        </span>
      )}
    </button>
  );
}