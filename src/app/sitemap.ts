import type { MetadataRoute } from "next";
import { getWrittenArticles } from "./_components/content";
import { routedSections } from "./_components/sections";
import { siteUrl } from "./_components/site-url";

/**
 * One entry per section route, then one per post written here. The section set comes
 * from the stored order; posts that are only a link out belong to the site they were
 * published on, not to this one.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sections, written] = await Promise.all([
    routedSections(),
    getWrittenArticles(),
  ]);

  return [
    ...sections.map((entry) => ({
      url: `${siteUrl}${entry.path === "/" ? "" : entry.path}`,
      changeFrequency: "monthly" as const,
      priority: entry.home ? 1 : 0.7,
    })),
    ...written.map((slug) => ({
      url: `${siteUrl}/articles/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
