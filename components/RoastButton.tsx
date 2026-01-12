"use client";
import { useState } from "react";
import { roastUserAction } from "@/app/actions";

export default function RoastButton() {
  const [loading, setLoading] = useState(false);

  const handleRoast = async () => {
    setLoading(true);
    // REMOVED username: The action finds the user via session
    const verdict = await roastUserAction(); 
    alert(verdict);
    setLoading(false);
  };

  return (
    <button 
      onClick={handleRoast}
      disabled={loading}
      className="text-[10px] text-gray-600 hover:text-red-500 transition-colors uppercase font-mono mt-4"
    >
      [ REQUEST_ROAST ]
    </button>
  );
}