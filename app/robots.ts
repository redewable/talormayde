import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://talormayde.com"; // CHANGE THIS TO YOUR REAL DOMAIN

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/*"], // HIDE ADMIN FROM GOOGLE
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}