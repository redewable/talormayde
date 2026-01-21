import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google"; 
import "./globals.css";
import NavBar from "../components/NavBar";

// Load Fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

// --- SEO & GEO CONFIGURATION ---
export const metadata: Metadata = {
  title: {
    default: "Talormayde | Digital Architecture & Media",
    template: "%s | Talormayde"
  },
  description: "We build digital empires. Full-stack development, cinematic storytelling, and generative engine optimization for brands ready to scale.",
  keywords: ["Digital Architecture", "Web Development", "Video Production", "SEO", "Next.js", "Talormayde", "Texas"],
  
  // Social Media Cards (Open Graph)
  openGraph: {
    title: "Talormayde | Build Legacy",
    description: "Digital architecture built for performance. Web. Video. Strategy.",
    url: "https://talormayde.com",
    siteName: "Talormayde",
    locale: "en_US",
    type: "website",
  },

  // Twitter/X Cards
  twitter: {
    card: "summary_large_image",
    title: "Talormayde",
    description: "Engineering the standard of excellence.",
    creator: "@talormayde",
  },

  // Robot Instructions (For Google & AIs)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <NavBar />
        {children}
      </body>
    </html>
  );
}
