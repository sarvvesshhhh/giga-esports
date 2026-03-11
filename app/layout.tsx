import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

const sansFont = Inter({ subsets: ["latin"], variable: "--font-sans" });
const monoFont = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "GigaEsports | Command Center",
  description: "Identity-driven esports tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen font-sans antialiased transition-colors duration-300",
            // LIGHT MODE: Light Grey Paper Background
            "bg-[#F0F0F0] text-zinc-900", 
            // DARK MODE: Matte Black Tactical Background
            "dark:bg-zinc-950 dark:text-zinc-100", 
            sansFont.variable,
            monoFont.variable
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system" // Changed from 'dark' to 'system' to allow toggling
            enableSystem // Changed to true to respect user settings
            disableTransitionOnChange
          >
            {/* Noise Texture Overlay (Kept your nice touch) */}
            <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            
            <main className="relative flex min-h-screen flex-col">
              {children}
            </main>
            
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}