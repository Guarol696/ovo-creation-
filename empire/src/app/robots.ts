import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/settings", "/learn/", "/api/"] },
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}
