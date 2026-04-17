import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Footer } from "@/components/footer";

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
            "bg-[#F0F0F0] text-zinc-900", 
            "dark:bg-zinc-950 dark:text-zinc-100", 
            sansFont.variable,
            monoFont.variable
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem 
            disableTransitionOnChange
          >
            {/* Overlay 1: Noise Texture */}
            <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            
            {/* Overlay 2: Ambient Millimeter Grid for Tactical Depth */}
            <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            <div className="relative z-10 flex min-h-screen flex-col">
              <main className="flex-grow flex flex-col">
                {children}
              </main>
              <Footer />
            </div>
            
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}