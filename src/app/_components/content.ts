import "server-only";

import { api } from "@convex/_generated/api";
import { CACHE_KEYS, type CacheKey } from "@convex/lib/wire";
import type { WritableSection } from "@convex/lib/writable";
import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";

/**
 * The site's read path: one cached loader per section.
 *
 * Every loader is its own cache entry, tagged `portfolio:<section>` and given the
 * `max` lifetime — the content changes when its author saves it and at no other
 * time, so there is nothing for a timer to do. Saving revalidates only the tags
 * that changed (`_actions/content.ts`), which is why these are separate functions
 * rather than one read of the whole document.
 *
 * Route segments cache their own output too, so they declare the tags of every
 * loader they reach. A segment that reads a section without naming its tag would
 * keep serving the old copy after a save.
 */

export { CACHE_KEYS, type CacheKey };

export function tagFor(key: CacheKey | string): string {
  return `portfolio:${key}`;
}

export async function getSite() {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("site"));
  return fetchQuery(api.content.site, {});
}

/** Which sections exist, in what order, under what wording. */
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

/**
 * A record's written body, and the slugs in a section that have one. Both carry the
 * section's own tag: a body saved in the editor refreshes the list, the section's
 * route and the page the record has of its own, and nothing else.
 */
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
