import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Navbar from "@/components/Navbar"; // Ensure this path is correct

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GigaEsports | Dominate the Game",
  description: "The ultimate AI-powered esports intelligence platform.",
  icons: {
    icon: "/logo.jpg", 
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