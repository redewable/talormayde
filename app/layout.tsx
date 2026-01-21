import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google"; 
import "./globals.css";
import ClientLayout from "./ClientLayout"; 
import Footer from "@/components/Footer"; 
import Grain from "@/components/Grain"; 

// Load Fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

// --- SEO CONFIGURATION ---
export const metadata: Metadata = {
  title: {
    default: "talormayde | Digital Architecture & Media",
    template: "%s | Talormayde"
  },
  description: "We build digital empires. Full-stack development, cinematic storytelling, and generative engine optimization.",
  keywords: ["Digital Architecture", "Web Development", "Video Production", "SEO", "Next.js", "Talormayde", "Texas"],
  openGraph: {
    title: "talormayde | Build Legacy",
    description: "Digital architecture built for performance.",
    url: "https://talormayde.com",
    siteName: "talormayde",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${space.variable} bg-zinc-950 text-white font-sans antialiased selection:bg-white selection:text-black`}>
        
        <Grain />

        <ClientLayout>
          {children}
          <Footer />
        </ClientLayout>
        
      </body>
    </html>
  );
}
