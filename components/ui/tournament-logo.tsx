// components/ui/tournament-logo.tsx
"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";

export function TournamentLogo({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <Trophy className="w-5 h-5 text-zinc-600" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-lg"
      onError={() => setHasError(true)}
    />
  );
}