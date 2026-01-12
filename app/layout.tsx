import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Navbar from "@/components/Navbar"; 

const inter = Inter({ subsets: ["latin"] });

// 🚀 SEO WARHEAD: This controls how Google sees your site
export const metadata: Metadata = {
  title: "GigaEsports | Dominate the Game",
  description: "The ultimate AI-powered esports intelligence platform. Track Valorant stats, live scores, and pro rosters in real-time.",
  
  // 🔑 KEYWORDS: What people type to find you
  keywords: [
    "Esports Tracker",
    "Valorant Live Scores",
    "VLR.gg Alternative",
    "Esports AI",
    "GigaEsports",
    "Valorant Rosters",
    "Gaming Intelligence",
    "Valorant Champions Tour"
  ],
  
  // 👤 AUTHORS
  authors: [{ name: "Giga Chad Dev", url: "https://gigaesports.in" }],
  
  // 🖼️ ICONS (Browser Tab)
  icons: {
    icon: "/icon.png", // Ensure you put icon.png in your 'public/' folder
    shortcut: "/icon.png",
    apple: "/icon.png",
  },

  // 🐦 SOCIAL MEDIA (Twitter/Discord Cards)
  openGraph: {
    title: "GigaEsports | Dominate the Game",
    description: "Real-time Valorant intelligence and live scores.",
    url: "https://gigaesports.in",
    siteName: "GigaEsports",
    images: [
      {
        url: "/og-image.jpg", // Add a cool banner image in 'public/' named og-image.jpg
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: "#ff4655" },
      }}
    >
      <html lang="en">
        <body className={`${inter.className} bg-black text-white`}>
          {/* 1. NAVBAR (Fixed at top) */}
          <Navbar />
          
          {/* 2. MAIN CONTENT (With padding so it doesn't hide behind Navbar) */}
          <div className="pt-20 min-h-screen"> 
            {children} 
          </div>
          
        </body>
      </html>
    </ClerkProvider>
  );
}