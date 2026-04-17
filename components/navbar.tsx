"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Sun, Moon, MessageSquareWarning } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { UserButton, useUser } from "@clerk/nextjs"; 

// Synced perfectly with the Footer directory
const navItems = [
  { name: "HQ", href: "/dashboard" },
  { name: "Schedule", href: "/schedule" },
  { name: "Tournaments", href: "/tournaments" },
  { name: "Live Matches", href: "/live" },
  { name: "GigaScore", href: "/gigascore" },
  { name: "Simulation", href: "/simulation" },
];

export function Navbar() {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const { user, isLoaded } = useUser(); 
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto max-w-[1200px] flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* Logo & Main Nav Section */}
        <div className="flex items-center gap-8">
          
          {/* Custom Image Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image 
              src="/logo.png" 
              alt="GigaEsports Logo" 
              width={52} 
              height={55} 
              className="object-contain group-hover:opacity-80 transition-opacity"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "font-bold uppercase tracking-widest text-[10px] transition-all relative py-1",
                  pathname === item.href 
                    ? "text-red-600 dark:text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-red-600" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          
          {/* Status Indicator (Real Data) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm">
            <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse rounded-full" />
            <span className="font-bold uppercase text-[9px] text-emerald-600 dark:text-emerald-500 truncate max-w-[100px]">
              {isLoaded && user ? (user.username || user.firstName || "OPERATIVE").toUpperCase() : "..."}
            </span>
          </div>

          <div className="hidden md:block h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

          {/* Feedback Hook Button - WIRED TO BWD PROJECT */}
          <button 
            onClick={() => {
              window.open("http://localhost/feedback.html", "_blank");
            }}
            className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 hover:text-red-600 transition-colors uppercase tracking-widest"
          >
            <MessageSquareWarning className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Feedback</span>
          </button>

          {/* THEME TOGGLE */}
          {mounted ? (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-zinc-400 hover:text-red-600 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Moon className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>
          ) : (
            <div className="w-8 h-8 md:w-9 md:h-9" />
          )}

          {/* Notifications */}
          <button className="p-2 text-zinc-400 hover:text-red-600 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900">
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          {/* Clerk User Profile */}
          <div className="flex items-center justify-center pl-2">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7 md:h-8 md:w-8 border border-zinc-200 dark:border-zinc-800 hover:border-red-600 transition-colors rounded-sm"
                }
              }}
            />
          </div>

        </div>
      </div>
    </header>
  );
}