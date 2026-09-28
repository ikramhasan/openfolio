import type { MetadataRoute } from "next";
import {
  getArticles,
  getAwards,
  getExperience,
  getIntro,
  getProjects,
  getWritten,
} from "./_components/content";
import { routedSections } from "./_components/sections";
import { isoDate } from "./_components/seo";
import { siteUrl } from "./_components/site-url";
import {
  readPath,
  slugOf,
  WRITABLE_SECTIONS,
  type WritableSection,
} from "./_components/writing";

type Dated = { slug: string; date?: string; image?: string | null };

async function visible(section: WritableSection): Promise<Dated[]> {
  switch (section) {
    case "articles":
      return (await getArticles()).items.map((item) => ({
        slug: slugOf(item),
        date: item.publishedAt,
        image: item.coverImage,
      }));
    case "awards":
      return (await getAwards()).items.map((item) => ({
        slug: slugOf(item),
        date: item.date,
      }));
    case "projects":
      return (await getProjects()).items.map((item) => ({
        slug: slugOf(item),
        image: item.logo,
      }));
    case "experience":
      return (await getExperience()).items.map((item) => ({
        slug: slugOf(item),
      }));
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sections, intro, written] = await Promise.all([
    routedSections(),
    getIntro(),
    Promise.all(
      WRITABLE_SECTIONS.map(async (section) => {
        const [slugs, items] = await Promise.all([
          getWritten(section),
          visible(section),
        ]);
        const native = new Set(slugs);
        return {
          section,
          items: items.filter((item) => item.slug && native.has(item.slug)),
        };
      }),
    ),
  ]);

  return [
    ...sections.map((entry) => ({
      url: `${siteUrl}${entry.path === "/" ? "" : entry.path}`,
      changeFrequency: "monthly" as const,
      priority: entry.home ? 1 : 0.7,
    })),
    ...(intro.resume
      ? [
          {
            url: `${siteUrl}/cv`,
            changeFrequency: "monthly" as const,
            priority: 0.6,
          },
        ]
      : []),
    ...written.flatMap(({ section, items }) =>
      items.map((item) => {
        const lastModified = item.date ? isoDate(item.date) : undefined;
        return {
          url: `${siteUrl}${readPath(section, item.slug)}`,
          ...(lastModified ? { lastModified } : {}),
          changeFrequency: "monthly" as const,
          priority: section === "articles" ? 0.8 : 0.5,
          ...(item.image ? { images: [item.image] } : {}),
        };
      }),
    ),
  ];
}
