import type { MetadataRoute } from "next";
import { getWritten } from "./_components/content";
import { routedSections } from "./_components/sections";
import { siteUrl } from "./_components/site-url";
import { readPath, WRITABLE_SECTIONS } from "./_components/writing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sections, written] = await Promise.all([
    routedSections(),
    Promise.all(
      WRITABLE_SECTIONS.map(async (section) => ({
        section,
        slugs: await getWritten(section),
      })),
    ),
  ]);

  return [
    ...sections.map((entry) => ({
      url: `${siteUrl}${entry.path === "/" ? "" : entry.path}`,
      changeFrequency: "monthly" as const,
      priority: entry.home ? 1 : 0.7,
    })),
    ...written.flatMap(({ section, slugs }) =>
      slugs.map((slug) => ({
        url: `${siteUrl}${readPath(section, slug)}`,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ),
  ];
}
