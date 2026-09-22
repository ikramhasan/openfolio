import portfolioJson from "../../../data/portfolio.json";

/**
 * Typed view over `data/portfolio.json`, cast once here because the raw JSON
 * infers awkward union types.
 *
 * Adding a section: add it to the JSON under `sections` plus `sectionOrder`,
 * declare its shape below, then register the component in `sections.tsx`.
 */

export type SocialLink = {
  order: number;
  site: string;
  title: string;
  url: string;
};

export type Action = {
  label: string;
  url?: string | null;
  type?: string;
  calendar?: { namespace: string; username: string };
};

/** Every section's heading row. `note` and `navLabel` are optional at source. */
export type SectionHeader = {
  title: string;
  /** One-line gloss under the panel heading. */
  note?: string;
  /** Shorter wording for the rail. Falls back to the title. */
  navLabel?: string;
};

type ListSection<Item> = SectionHeader & { items: Item[] };

export type Portfolio = {
  site: { title: string; description: string };
  sectionOrder: string[];
  sections: {
    intro: SectionHeader & {
      bio: string;
      profileImage: string;
      headingImages: { url: string; alt: string }[];
      socialLinks: SocialLink[];
      actions: Action[];
    };
    /** Heading only: the panel's body is composed from the other sections. */
    about: SectionHeader;
    /** Retained because the JSON still carries it; unused in the UI. */
    skills: ListSection<{
      icon: string;
      level: number;
      order: number;
      title: string;
      url: string;
    }>;
    education: ListSection<{
      dateRange: string;
      description: string | null;
      institution: string;
      location: string;
      logo: string;
      title: string;
      url: string | null;
    }>;
    experience: ListSection<{
      company: string;
      dateRange: string;
      details: string[];
      location: string;
      logo: string;
      order: number;
      title: string;
      url: string | null;
    }>;
    youtubeVideos: ListSection<{
      order: number;
      thumbnail: string;
      title: string;
      url: string;
    }>;
    articles: ListSection<{
      title: string;
      url: string;
      coverImage: string;
      publishedAt: string;
      readTimeMinutes: number;
      views: number;
      pinned?: boolean;
      excerpt: string | null;
    }> & { viewAll: { label: string; url: string } };
    projects: ListSection<{
      description: string;
      link: string;
      logo: string;
      order: number;
      tags: string[];
      title: string;
    }>;
    awards: ListSection<{
      date: string;
      description: string;
      logo: string;
      order: number;
      organization: string;
      title: string;
      url: string | null;
    }>;
    recommendations: ListSection<{
      author: { bio: string; image: string; name: string };
      body: string;
      title: string;
      url: string;
    }>;
    connect: SectionHeader & {
      newsletter: {
        inputLabel: string;
        placeholder: string;
        submitLabel: string;
        loadingLabel: string;
        messages: { invalidEmail: string; success: string; error: string };
      };
    };
  };
  footer: {
    signature: { type: string; owner: string; image: string };
    socialLinks: SocialLink[];
    actions: Action[];
    copyright: string;
  };
};

export const portfolio = portfolioJson as unknown as Portfolio;

export const sections = portfolio.sections;

/** Source order of the page's sections, including `intro`. */
export const sectionOrder = portfolio.sectionOrder;

// Read structurally, so the registry can resolve a heading for a section not yet
// added to the `Portfolio` type.
export const sectionMeta: Record<string, SectionHeader | undefined> =
  portfolio.sections;

export const sortedExperience = [...sections.experience.items].sort(
  (a, b) => a.order - b.order,
);

export const sortedAwards = [...sections.awards.items].sort(
  (a, b) => a.order - b.order,
);

export const sortedVideos = [...sections.youtubeVideos.items].sort(
  (a, b) => a.order - b.order,
);

export const sortedProjects = [...sections.projects.items].sort(
  (a, b) => a.order - b.order,
);

/** Newest first; the source order interleaves a pinned post. */
export const sortedArticles = [...sections.articles.items].sort(
  (a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
);

export const footerLinks = [...portfolio.footer.socialLinks].sort(
  (a, b) => a.order - b.order,
);

export const currentRole = sortedExperience[0];

type Link = { label: string; url: string };

// A `calendar` action addresses Cal.com by user and event rather than by URL.
function actionLink(action: Action): Link | null {
  if (action.calendar) {
    const { username, namespace } = action.calendar;
    return {
      label: action.label,
      url: `https://cal.com/${username}/${namespace}`,
    };
  }

  return action.url ? { label: action.label, url: action.url } : null;
}

export const footerActions = portfolio.footer.actions
  .map(actionLink)
  .filter((link): link is Link => link !== null);

// The source `viewAll.url` is a relative path from the old site, so an unusable
// one falls back to the origin of the articles' own absolute URLs.
export const blogUrl = (() => {
  const authored = sections.articles.viewAll.url;
  if (/^https?:\/\//.test(authored)) return authored;

  const sample = sections.articles.items[0]?.url;
  if (!sample) return null;

  try {
    return new URL(sample).origin;
  } catch {
    return null;
  }
})();

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

/**
 * The year that anchors an entry.
 *
 * Source date ranges are written long-hand and inconsistently
 * ("October, 2022 - Present", "2019 - 2022"), so the first four-digit run is
/**
 * The start year of a source range. These are written long-hand and
 * inconsistently ("October, 2022 - Present", "2019 - 2022"), so the first
 * four-digit run wins.
 */
export function startYear(value: string): string {
  return value.match(/\d{4}/)?.[0] ?? value.trim();
}

/** Source bullets are stored with a literal "- " prefix. */
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
 * A source range as two short endpoints — `["Feb 22", "Sep 22"]`. Ranges with no
 * months keep their years; ongoing ones end in "Now". A trailing "(Contract)" is
 * left to `rangeQualifier`.
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
