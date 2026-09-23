import { v } from "convex/values";

/**
 * The sections whose records can be written here rather than only linked out to.
 *
 * A record becomes a page of its own by having a body: a row in its section's body
 * table, keyed by the record's slug. One body table per section rather than one
 * table keyed by both, because the portfolio is stored a table per section and
 * because `articleBodies` was already spelled that way — generalising by renaming
 * it would have orphaned every post already written.
 *
 * A section key is also its record table's name, here and throughout the schema.
 */

export const WRITABLE_SECTIONS = [
  "experience",
  "projects",
  "articles",
  "awards",
] as const;

export type WritableSection = (typeof WRITABLE_SECTIONS)[number];

/** As an argument. Anything else has no body table to reach. */
export const writableSection = v.union(
  v.literal("experience"),
  v.literal("projects"),
  v.literal("articles"),
  v.literal("awards"),
);

/** All four hold `{ slug, value, updatedAt }` and index `slug`. */
export const BODY_TABLES = {
  experience: "experienceBodies",
  projects: "projectBodies",
  articles: "articleBodies",
  awards: "awardBodies",
} as const satisfies Record<WritableSection, string>;

export type BodyTable = (typeof BODY_TABLES)[WritableSection];

/**
 * A title as a URL segment. Accents are decomposed and their marks dropped, so
 * "Résumé" and "Resume" address the same page rather than one of them being escaped
 * into noise.
 */
export function toSlug(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * What addresses a record's page. Articles carry a slug of their own, because theirs
 * was published elsewhere first and has to keep matching; every other section
 * derives one from the title, which is what the lists already key rows by.
 *
 * So renaming a record moves its page, and the body it had stays under the old
 * address — the same sharp edge renaming an article's slug has always had.
 */
export function slugOf(record: { title: string; slug?: string }): string {
  return record.slug?.trim() || toSlug(record.title);
}
