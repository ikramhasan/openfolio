import {
  slugOf,
  WRITABLE_SECTIONS,
  type WritableSection,
} from "@convex/lib/writable";

/**
 * Where a written record is read and where it is written.
 *
 * Which sections can carry a body is declared once, in `convex/lib/writable.ts`,
 * because the body tables and the addressing are there; this is the routing half of
 * it. Both paths are spelled here rather than in the components that link to them,
 * so a section's page and the editor's way into it cannot drift apart.
 *
 * `read` must match the route folder under `(site)`, which is also the section's own
 * route in `_components/sections.tsx` — a written record sits under its section.
 */

export { slugOf, WRITABLE_SECTIONS, type WritableSection };

const READ_BASE: Record<WritableSection, string> = {
  experience: "/experience",
  projects: "/projects",
  articles: "/articles",
  awards: "/awards",
};

/** The editor's route, one page for all four sections. */
export const WRITE_BASE = "/admin/write";

export function readPath(section: WritableSection, slug: string): string {
  return `${READ_BASE[section]}/${slug}`;
}

export function writePath(section: WritableSection, slug: string): string {
  return `${WRITE_BASE}/${section}/${slug}`;
}

/** Narrows a route segment, which is a string until it has been checked. */
export function isWritableSection(value: string): value is WritableSection {
  return (WRITABLE_SECTIONS as readonly string[]).includes(value);
}
