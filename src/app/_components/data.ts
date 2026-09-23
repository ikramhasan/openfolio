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

/** An ISO date written out, for a page that is about one day rather than a range. */
export function longDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
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

/**
 * A Spotify link as the player that plays it, or `null` for anything that is not one
 * — a mistyped record is left out rather than rendered as a broken frame, and a
 * `javascript:` value never reaches an `src`.
 *
 * Share links carry a `si` parameter and sometimes a locale, and may already be embed
 * links; all that matters is what kind of thing it is and its id.
 */
export function spotifyEmbed(
  url: string,
): { src: string; height: number; kind: string } | null {
  try {
    const { protocol, hostname, pathname } = new URL(url);
    if (protocol !== "https:") return null;
    if (hostname !== "spotify.com" && !hostname.endsWith(".spotify.com")) {
      return null;
    }

    const [kind, id] = pathname
      .split("/")
      .filter(
        (part) => part !== "" && part !== "embed" && !part.startsWith("intl-"),
      );

    if (!kind || !id) return null;

    // One thing fits the compact player; a collection needs room for its list.
    const height = kind === "track" || kind === "episode" ? 80 : 152;

    return {
      src: `https://open.spotify.com/embed/${kind}/${id}?theme=0`,
      height,
      kind,
    };
  } catch {
    return null;
  }
}

/** A URL as the site it points at — "figma.com". Unparseable values are left alone. */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.trim();
  }
}

/**
 * Google's favicon service, which answers for any host and falls back to a globe
 * rather than a 404. Hot-linked rather than copied into storage: it is the site's own
 * mark, and an upload replaces it whenever the author would rather hold the file.
 *
 * `""` for anything that is not an http(s) URL, which is what the button keys off.
 */
export function faviconUrl(url: string, size = 128): string {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "http:" && protocol !== "https:") return "";

    return `https://www.google.com/s2/favicons?sz=${size}&domain=${hostname}`;
  } catch {
    return "";
  }
}

/**
 * Records grouped under their category, in the order the categories first appear —
 * so dragging a row in the editor orders the groups as well as the rows.
 *
 * Matched case-insensitively, because a category is free text typed twice; the first
 * spelling is the one shown. A record with no category joins a trailing group rather
 * than disappearing.
 */
export function groupByCategory<T extends { category: string }>(
  items: T[],
  fallback = "Other",
): { name: string; items: T[] }[] {
  const groups = new Map<string, { name: string; items: T[] }>();

  for (const item of items) {
    const name = item.category.trim() || fallback;
    const key = name.toLowerCase();
    const group = groups.get(key);

    if (group) group.items.push(item);
    else groups.set(key, { name, items: [item] });
  }

  // The fallback group last, wherever its first record happened to sit.
  return [...groups.values()].sort((a, b) => {
    const left = a.name === fallback ? 1 : 0;
    const right = b.name === fallback ? 1 : 0;
    return left - right;
  });
}
