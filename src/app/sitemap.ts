import type { MetadataRoute } from "next";
import { routedSections } from "./_components/sections";
import { siteUrl } from "./_components/site-url";

/** One entry per section route. The set comes from the stored section order. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sections = await routedSections();

  return sections.map((entry) => ({
    url: `${siteUrl}${entry.path === "/" ? "" : entry.path}`,
    changeFrequency: "monthly" as const,
    priority: entry.home ? 1 : 0.7,
  }));
}
