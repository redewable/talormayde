import { MetadataRoute } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase"; // Ensure this path points to your firebase config

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://talormayde.com"; // CHANGE THIS TO YOUR REAL DOMAIN

  // 1. Static Routes (The pages we know exist)
  const routes = [
    "",
    "/about",
    "/services",
    "/contact",
    "/login",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 1,
  }));

  // 2. Dynamic Project Routes (Optional - If you ever create detail pages)
  /* Right now your projects link to external URLs, so we don't index them here.
     But if you ever build /work/[id], you would fetch Firebase data here.
  */

  return [...routes];
}