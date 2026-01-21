import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar"; // <--- 1. IMPORT THIS

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Talormayde | Legacy Digital",
  description: "Standard of Excellence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <NavBar /> {/* <--- 2. ADD THIS HERE */}
      </body>
    </html>
  );
}
