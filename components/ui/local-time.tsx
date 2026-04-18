"use client";

import { useState, useEffect } from "react";

interface LocalTimeProps {
  isoString: string;
}

export function LocalTime({ isoString }: LocalTimeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const matchDate = new Date(isoString);

  // Fallback for SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex flex-col items-end">
        <span className="font-mono text-xs uppercase font-bold tracking-wider text-zinc-300">
          {matchDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
          {matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC
        </span>
      </div>
    );
  }

  // Once mounted on client, render with their local browser timezone
  return (
    <div className="flex flex-col items-end">
      <span className="font-mono text-xs uppercase font-bold tracking-wider text-zinc-300">
        {matchDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
        {matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}
