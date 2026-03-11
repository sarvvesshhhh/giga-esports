"use client";

import { useState, useEffect } from "react"; // Added useEffect
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Sun, Moon } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { UserButton, useUser } from "@clerk/nextjs"; 

const navItems = [
  { name: "HQ", href: "/dashboard" },
  { name: "Schedule", href: "/schedule" },
  { name: "Tournaments", href: "/tournaments" },
  { name: "Live Matches", href: "/live" },
  { name: "GigaScore", href: "/gigascore" },
];

export function Navbar() {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const { user, isLoaded } = useUser(); 
  
  // Fix: Ensure we are mounted before rendering theme specific UI
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 bg-red-600 flex items-center justify-center text-white transform skew-x-[-10deg] hover:skew-x-0 transition-transform">
              <span className="font-black italic text-xl transform skew-x-[10deg]">G</span>
            </div>
            <span className="text-xl font-black uppercase tracking-tighter italic text-zinc-900 dark:text-white hidden md:block">
              GIGA<span className="text-red-600">ESPORTS</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
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

        {/* Right Side */}
        <div className="flex items-center gap-4">
          
          {/* Status Indicator (Real Data) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
            <span className="font-bold uppercase text-[9px] text-emerald-600 dark:text-emerald-500 truncate max-w-[100px]">
              {isLoaded && user ? (user.username || user.firstName || "OPERATIVE").toUpperCase() : "..."}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

          {/* THEME TOGGLE (Fixed) */}
          {mounted ? (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-zinc-400 hover:text-red-600 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          ) : (
            // Placeholder while loading to prevent layout shift
            <div className="w-9 h-9" />
          )}

          <button className="text-zinc-400 hover:text-red-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          {/* User Profile */}
          <div className="flex items-center justify-center pl-2">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 border border-zinc-200 dark:border-zinc-800 hover:border-red-600 transition-colors"
                }
              }}
            />
          </div>

        </div>
      </div>
    </header>
  );
}