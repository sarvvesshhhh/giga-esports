"use client";

import { cn } from "@/lib/utils";

interface GigaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string; 
  variant?: "default" | "critical" | "warning" | "success";
}

export function GigaCard({ 
  children, 
  className, 
  label, 
  variant = "default",
  ...props 
}: GigaCardProps) {
  
  const variantStyles = {
    default: "border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 hover:border-zinc-300 dark:hover:border-zinc-700 backdrop-blur-md shadow-lg shadow-black/5",
    critical: "border-red-500/50 bg-red-50/50 dark:bg-red-950/20 hover:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)] backdrop-blur-md",
    warning: "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-md",
    success: "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-md",
  };

  const labelColors = {
    default: "text-zinc-500 dark:text-zinc-500",
    critical: "text-red-600 dark:text-red-500",
    warning: "text-amber-600 dark:text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    success: "text-emerald-600 dark:text-emerald-500",
  };

  return (
    <div 
      className={cn(
        "relative border transition-all duration-300 group", 
        "[clip-path:polygon(0_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%)]",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Top Border Decor - The 'Notch' */}
      <div className="absolute top-0 left-0 w-full h-[2px] flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
         <div className={cn(
           "h-full w-8 bg-zinc-900 dark:bg-zinc-100", 
           variant === "critical" && "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]",
           variant === "warning" && "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
          )} />
      </div>

      {/* The Technical Label */}
      {label && (
        <div className={cn(
          "absolute top-4 right-4 font-extrabold uppercase tracking-[0.2em] text-xs opacity-70",
          labelColors[variant]
        )}>
          {label}
        </div>
      )}

      {/* Content */}
      <div className="p-6 h-full relative z-10">
        {children}
      </div>
      
      {/* Corner Accent */}
      <div className={cn(
        "absolute bottom-0 right-0 w-3 h-[1px] -rotate-45 origin-bottom-right translate-y-[-4px] translate-x-[-4px]",
        variant === "critical" ? "bg-red-500" : 
        variant === "warning" ? "bg-amber-500" : "bg-zinc-400 dark:bg-zinc-700"
      )} />
    </div>
  );
}