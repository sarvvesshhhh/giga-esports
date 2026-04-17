"use client";

import Link from "next/link";
import Image from "next/image";
import { Terminal, Shield, Github } from "lucide-react";

export function Footer() {
  // Exact match to your Navbar categories
  const directoryLinks = [
    { name: "HQ", path: "/" },
    { name: "Schedule", path: "/schedule" },
    { name: "Tournaments", path: "/tournaments" },
    { name: "Live Matches", path: "/live-matches" },
    { name: "GigaScore", path: "/gigascore" },
  ];

  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md text-zinc-400 py-12 font-sans relative overflow-hidden mt-20">
      {/* Subtle glowing red line at the top of the footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

      <div className="container mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">

          {/* Brand & Status Column */}
          <div className="col-span-1 md:col-span-2 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              {/* CUSTOM LOGO DROP IN HERE */}
              {/* Make sure 'logo.png' is in your Next.js 'public' folder */}
              <Image 
                src="/logo.png" 
                alt="GigaEsports Logo" 
                width={100} // Tweak width as needed
                height={40}  // Tweak height as needed
                className="group-hover:opacity-80 transition-opacity object-contain"
              />
            </Link>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-6 max-w-sm leading-relaxed">
              // An Identity-Driven Esports Platform.<br/>
              Quantifying fan engagement through Memory, Meaning, and Accountability.
            </p>
            
            {/* Terminal Status Indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[10px] font-mono border border-zinc-800 bg-zinc-900/50 px-3 py-1 rounded-sm text-emerald-500 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                System Online
              </div>
              {/* Protocol v1.0 removed as requested */}
            </div>
          </div>

          {/* Directory Navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
              <Terminal className="w-3 h-3 text-red-600" /> Directory
            </h4>
            
            {/* Synced Links */}
            {directoryLinks.map((item) => (
              <Link 
                key={item.name} 
                href={item.path} 
                className="text-[10px] font-mono text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-widest w-fit flex items-center gap-2 before:content-['>'] before:opacity-0 hover:before:opacity-100 before:transition-opacity"
              >
                {item.name}
              </Link>
            ))}

            {/* Connected Feedback Hook */}
            <button 
              onClick={() => {
                // Wired up to your BWD project!
                window.open("http://localhost/feedback.html", "_blank");
              }}
              className="text-[10px] font-mono text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-widest w-fit flex items-center gap-2 before:content-['>'] before:opacity-0 hover:before:opacity-100 before:transition-opacity mt-2 text-left"
            >
              Feedback / Intel
            </button>
          </div>

          {/* Project Clearances / Credits */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
              <Shield className="w-3 h-3 text-red-600" /> Clearances
            </h4>
            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest space-y-2">
              <p className="text-zinc-400 border-b border-zinc-800 pb-1 mb-2 inline-block">NMIMS MPSTME B.Tech IT</p>
              <p className="hover:text-zinc-300 transition-colors cursor-default">Operative F068 [Sarvesh]</p>
              <p className="hover:text-zinc-300 transition-colors cursor-default">Operative F037 [Daksh]</p>
              <p className="hover:text-zinc-300 transition-colors cursor-default">Operative F066 [Alston]</p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} GIGAESPORTS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-4 text-zinc-600">
            <Link href="https://github.com/sarvvesshhhh" target="_blank" className="hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}