import {
  slugOf,
  WRITABLE_SECTIONS,
  type WritableSection,
} from "@convex/lib/writable";

export { slugOf, WRITABLE_SECTIONS, type WritableSection };

const READ_BASE: Record<WritableSection, string> = {
  experience: "/experience",
  projects: "/projects",
  articles: "/articles",
  awards: "/awards",
};

export const WRITE_BASE = "/admin/write";

export function readPath(section: WritableSection, slug: string): string {
  return `${READ_BASE[section]}/${slug}`;
}

export function writePath(section: WritableSection, slug: string): string {
  return `${WRITE_BASE}/${section}/${slug}`;
}

export function isWritableSection(value: string): value is WritableSection {
  return (WRITABLE_SECTIONS as readonly string[]).includes(value);
}
