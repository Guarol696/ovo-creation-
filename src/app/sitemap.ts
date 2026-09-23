import type { MetadataRoute } from "next";
import { routes, siteConfig } from "@/config/site";

const publicPaths = [
  routes.home,
  routes.createTrip,
  routes.about,
  routes.contact,
  routes.terms,
  routes.privacy,
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified: new Date(),
  }));
}
