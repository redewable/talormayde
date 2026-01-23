"use client";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import PageTransition from "@/components/PageTransition"; 
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          
          {/* Persistent Nav - Hidden on admin */}
          {!isAdmin && <NavBar />}

          {/* Main Content with Smooth Transition */}
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow flex flex-col">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            {!isAdmin && <Footer />}
          </div>

        </ThemeProvider>
      </body>
    </html>
  );
}