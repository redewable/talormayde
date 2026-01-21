"use client"; // This must be a client component to handle the loading state
import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AnimatePresence mode="wait">
            {loading ? (
              <Preloader key="preloader" onComplete={() => setLoading(false)} />
            ) : (
              <>
                <NavBar />
                <main>{children}</main>
                <Footer />
              </>
            )}
          </AnimatePresence>
        </ThemeProvider>
      </body>
    </html>
  );
}