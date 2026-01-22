"use client";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
//* later import GrainOverlay from "@/components/GrainOverlay";
import PageTransition from "@/components/PageTransition"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          
          {/* 1. Texture Layer (Always Top) use later
          <div className="canvas-texture" aria-hidden="true" />
          <GrainOverlay />

          {/* 2. Persistent Nav */}
          <NavBar />

          {/* 3. Main Content with Smooth Transition */}
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow flex flex-col">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <Footer />
          </div>

        </ThemeProvider>
      </body>
    </html>
  );
}