"use client";

import Link from "next/link";
import Image from "next/image"; // <--- Import Image
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

// ... keep NAV_ITEMS ...
const NAV_ITEMS = [
  { label: "HQ", href: "/" },
  { label: "SCHEDULE", href: "/schedule" },
  { label: "TOURNAMENTS", href: "/tournaments" },
   { label: "VALORANT", href: "/valorant" }, // NEW (VLR API)
  { label: "ADMIN", href: "/admin" }, // Keep this secret-ish
];


export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-[#222] bg-black/50 backdrop-blur-md fixed top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* NEW LOGO IMPLEMENTATION */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="relative w-12 h-12 overflow-hidden rounded-full border border-gray-800">
            <Image 
              src="/logo.png" 
              alt="GigaEsports Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <span className="text-lg font-black tracking-tighter text-white italic hidden sm:block">
            GIGA<span className="text-red-600">ESPORTS</span>
          </span>
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`text-[10px] tracking-[0.2em] font-bold uppercase transition-colors ${
                  isActive ? "text-red-500" : "text-gray-500 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* USER PROFILE */}
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
        </div>


      </div>
    </nav>
  );
}