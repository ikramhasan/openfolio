import "server-only";

import { api } from "@convex/_generated/api";
import { CACHE_KEYS, type CacheKey } from "@convex/lib/wire";
import type { WritableSection } from "@convex/lib/writable";
import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";

export { CACHE_KEYS, type CacheKey };

const EMPTY_SECTION_SLUG = "__none__";

export function tagFor(key: CacheKey | string): string {
  return `portfolio:${key}`;
}

export async function getSite() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("site"));
  return fetchQuery(api.content.site, {});
}

export async function getNav() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("nav"));
  return fetchQuery(api.content.nav, {});
}

export async function getIntro() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("intro"));
  return fetchQuery(api.content.intro, {});
}

export async function getAbout() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("about"));
  return fetchQuery(api.content.about, {});
}

export async function getEducation() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("education"));
  return fetchQuery(api.content.education, {});
}

export async function getExperience() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("experience"));
  return fetchQuery(api.content.experience, {});
}

export async function getVideos() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("youtubeVideos"));
  return fetchQuery(api.content.youtubeVideos, {});
}

export async function getArticles() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("articles"));
  return fetchQuery(api.content.articles, {});
}

export async function getBody(section: WritableSection, slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor(section));
  return fetchQuery(api.bodies.read, { section, slug });
}

export async function getWritten(section: WritableSection) {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor(section));
  return fetchQuery(api.bodies.written, { section });
}

export async function writtenParams(section: WritableSection) {
  const slugs = (await getWritten(section)).filter((slug) => slug.length > 0);
  if (slugs.length === 0) return [{ slug: EMPTY_SECTION_SLUG }];
  return slugs.map((slug) => ({ slug }));
}

export async function getProjects() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("projects"));
  return fetchQuery(api.content.projects, {});
}

export async function getTools() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("tools"));
  return fetchQuery(api.content.tools, {});
}

export async function getMusic() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("music"));
  return fetchQuery(api.content.music, {});
}

export async function getOpenSource() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("openSource"));
  return fetchQuery(api.content.openSource, {});
}

export async function getAwards() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("awards"));
  return fetchQuery(api.content.awards, {});
}

export async function getRecommendations() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("recommendations"));
  return fetchQuery(api.content.recommendations, {});
}

export async function getConnect() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("connect"));
  return fetchQuery(api.content.connect, {});
}

export async function getFooter() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("footer"));
  return fetchQuery(api.content.footer, {});
}
