import type {
  Action,
  ArticlesSection,
  OpenSourceSection,
  SocialLink,
} from "./types";

export type Link = { label: string; url: string };

export function byOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function sortedLinks(links: SocialLink[]): SocialLink[] {
  return [...links].sort((a, b) => a.order - b.order);
}

export function sortedArticles(
  items: ArticlesSection["items"],
): ArticlesSection["items"] {
  return [...items].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function sortedContributions(
  items: OpenSourceSection["items"],
): OpenSourceSection["items"] {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

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

export function formatCount(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}

export function repoParts(repo: string): {
  owner: string | null;
  name: string;
} {
  const at = repo.indexOf("/");
  if (at === -1) return { owner: null, name: repo.trim() };

  return { owner: repo.slice(0, at).trim(), name: repo.slice(at + 1).trim() };
}

export function cleanBullet(detail: string): string {
  return detail.replace(/^\s*-\s*/, "").trim();
}

export function dateEndpoints(dateRange: string): [string, string | null] {
  const ongoing = /present|current|now/i.test(dateRange);

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

export function rangeQualifier(dateRange: string): string | null {
  return dateRange.match(/\(([^)]+)\)/)?.[1] ?? null;
}

export function shortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return `${MONTHS[date.getUTCMonth()]} ${String(date.getUTCFullYear()).slice(2)}`;
}

export function longDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

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

export function formatTags(tags: string[]): string {
  return tags.map((tag) => tag.toLowerCase()).join(", ");
}

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

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.trim();
  }
}

export function faviconUrl(url: string, size = 128): string {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "http:" && protocol !== "https:") return "";

    return `https://www.google.com/s2/favicons?sz=${size}&domain=${hostname}`;
  } catch {
    return "";
  }
}

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

  return [...groups.values()].sort((a, b) => {
    const left = a.name === fallback ? 1 : 0;
    const right = b.name === fallback ? 1 : 0;
    return left - right;
  });
}
