"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { usePathname } from "next/navigation"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* FIX 1: Change attribute to "class" so it matches your globals.css */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          
          <div className="canvas-texture" aria-hidden="true" />

          {/* Persistent Nav (Stays outside animation) */}
          <NavBar />

          {/* Dynamic Page Content */}
          <AnimatePresence mode="wait">
            {/* FIX 2: Add unique key so Framer Motion knows when pages change */}
            <motion.div
              key={pathname} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col min-h-screen"
            >
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </motion.div>
          </AnimatePresence>

        </ThemeProvider>
      </body>
    </html>
  );
}