import type { MetadataRoute } from "next";
import { routes, siteConfig } from "@/config/site";

const publicPaths = [
  routes.home,
  routes.createTrip,
  routes.premium,
  routes.about,
  routes.contact,
  routes.terms,
  routes.privacy,
  routes.legalNotice,
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified: new Date(),
  }));
}
