import type { Action, ArticlesSection, SocialLink } from "./types";

/**
 * Sorting and formatting over the content, with no content of its own. The reads
 * live in `content.ts`; the shapes in `types.ts`.
 *
 * Source date ranges were written long-hand and inconsistently ("October, 2022 -
 * Present", "2019 - 2022"), and the editor keeps them that way, so the parsing
 * here stays deliberately forgiving.
 */

export type Link = { label: string; url: string };

/** Records that carry their own sort field. */
export function byOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function sortedLinks(links: SocialLink[]): SocialLink[] {
  return [...links].sort((a, b) => a.order - b.order);
}

/** Newest first; the stored order interleaves a pinned post. */
export function sortedArticles(
  items: ArticlesSection["items"],
): ArticlesSection["items"] {
  return [...items].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

// A `calendar` action addresses Cal.com by user and event rather than by URL. The
// editor's blank record leaves both empty, so an unfilled one is not a link.
function actionLink(action: Action): Link | null {
  const calendar = action.calendar;

  if (calendar?.username && calendar.namespace) {
    return {
      label: action.label,
      url: `https://cal.com/${calendar.username}/${calendar.namespace}`,
    };
  }

  return action.url ? { label: action.label, url: action.url } : null;
}

export function actionLinks(actions: Action[]): Link[] {
  return actions.map(actionLink).filter((link): link is Link => link !== null);
}

/**
 * Where "View all" points. The stored value is a relative path from the old site,
 * so an unusable one falls back to the origin of the posts' own absolute URLs.
 */
export function blogUrl(section: ArticlesSection): string | null {
  const authored = section.viewAll.url;
  if (/^https?:\/\//.test(authored)) return authored;

  const sample = section.items[0]?.url;
  if (!sample) return null;

  try {
    return new URL(sample).origin;
  } catch {
    return null;
  }
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Thousands abbreviated, for the Articles view counts. */
export function formatViews(views: number): string {
  return views >= 1000 ? `${(views / 1000).toFixed(1)}k` : String(views);
}

/** The start year of a range. The first four-digit run wins. */
export function startYear(value: string): string {
  return value.match(/\d{4}/)?.[0] ?? value.trim();
}

/** Stored bullets keep a literal "- " prefix. */
export function cleanBullet(detail: string): string {
  return detail.replace(/^\s*-\s*/, "").trim();
}

/** Computed rather than written down, so the About summary cannot go stale. */
export function yearsSince(dateRange: string): number {
  const start = Number(startYear(dateRange));
  if (!Number.isFinite(start)) return 0;
  return Math.max(1, new Date().getUTCFullYear() - start);
}

// "ICT Division | Govt. of Bangladesh" makes a chip twice the width of any other;
// the panel still shows the full name.
export function shortCompany(company: string): string {
  return company.split("|")[0].trim();
}

/**
 * A range as two short endpoints — `["Feb 22", "Sep 22"]`. Ranges with no months
 * keep their years; ongoing ones end in "Now". A trailing "(Contract)" is left to
 * `rangeQualifier`.
 */
export function dateEndpoints(dateRange: string): [string, string | null] {
  const ongoing = /present|current|now/i.test(dateRange);

  // "February, 2022" / "Feb 2022" / a bare "2022", in source order.
  const parts = [
    ...dateRange.matchAll(/([A-Za-z]+)[,\s]+(\d{4})|(\d{4})/g),
  ].map((match) => {
    const [, month, year, bareYear] = match;
    if (bareYear) return bareYear;

    const index = MONTHS.findIndex((name) =>
      month.toLowerCase().startsWith(name.toLowerCase()),
    );

    return index === -1 ? year : `${MONTHS[index]} ${year.slice(2)}`;
  });

  if (parts.length === 0) return [dateRange.trim(), null];

  const start = parts[0];
  if (ongoing) return [start, "Now"];

  const end = parts[parts.length - 1];
  return [start, end === start ? null : end];
}

/** A trailing "(Contract)", which qualifies the role rather than the dates. */
export function rangeQualifier(dateRange: string): string | null {
  return dateRange.match(/\(([^)]+)\)/)?.[1] ?? null;
}

/** An ISO date as one short endpoint. */
export function shortDate(iso: string): string {
  const date = new Date(iso);
  return `${MONTHS[date.getUTCMonth()]} ${String(date.getUTCFullYear()).slice(2)}`;
}

/** A range as years only, for the chip panels. Keeps a trailing "(Contract)". */
export function compactRange(dateRange: string): string {
  const years = dateRange.match(/\d{4}/g);
  if (!years) return dateRange.trim();

  const note = dateRange.match(/\(([^)]+)\)/)?.[1];
  const ongoing = /present|current/i.test(dateRange);

  const first = years[0];
  const last = years[years.length - 1];
  const span = ongoing
    ? `${first} – Present`
    : first === last
      ? first
      : `${first} – ${last}`;

  return note ? `${span} · ${note}` : span;
}

/** Tags are cased inconsistently at source ("UNMAINTAINED", "Unmaintained"). */
export function formatTags(tags: string[]): string {
  return tags.map((tag) => tag.toLowerCase()).join(", ");
}
