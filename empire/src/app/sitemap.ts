import type { MetadataRoute } from "next";
import { routes } from "@/config/site";
import { courses } from "@/data/courses";
import { paths } from "@/data/paths";
import { publicEnv } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    routes.home,
    routes.academy,
    routes.paths,
    routes.pricing,
    routes.assistant,
    routes.about,
    routes.contact,
    routes.terms,
    routes.privacy,
    ...["learn", "create", "launch"].map(routes.pillar),
    ...courses.map((course) => routes.course(course.slug)),
    ...paths.map((path) => routes.path(path.slug)),
  ];
  return pages.map((page) => ({ url: `${publicEnv.siteUrl}${page}` }));
}
