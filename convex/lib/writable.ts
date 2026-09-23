import { v } from "convex/values";

export const WRITABLE_SECTIONS = [
  "experience",
  "projects",
  "articles",
  "awards",
] as const;

export type WritableSection = (typeof WRITABLE_SECTIONS)[number];

export const writableSection = v.union(
  v.literal("experience"),
  v.literal("projects"),
  v.literal("articles"),
  v.literal("awards"),
);

export const BODY_TABLES = {
  experience: "experienceBodies",
  projects: "projectBodies",
  articles: "articleBodies",
  awards: "awardBodies",
} as const satisfies Record<WritableSection, string>;

export type BodyTable = (typeof BODY_TABLES)[WritableSection];

export function toSlug(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugOf(record: { title: string; slug?: string }): string {
  return record.slug?.trim() || toSlug(record.title);
}
