import portfolioJson from "../../../data/portfolio.json";

/**
 * Typed view over `data/portfolio.json`.
 *
 * The raw JSON infers awkward union types (several collections hold objects with
 * optional keys), so the shape is declared explicitly and the import is cast
 * once, here.
 *
 * ADDING A SECTION (e.g. "tools", "travels"):
 *   1. Add the section to `data/portfolio.json` under `sections`, and its id to
 *      `sectionOrder`.
 *   2. Declare its shape in `Portfolio["sections"]` below.
 *   3. Write the component, then register it in `sections.tsx`.
 * Nothing in `page.tsx` needs to change — the page renders whatever the registry
 * resolves. See `sections.tsx` for the ordering rules.
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

export type Portfolio = {
  site: { title: string; description: string };
  sectionOrder: string[];
  sections: {
    intro: {
      title: string;
      bio: string;
      profileImage: string;
      headingImages: { url: string; alt: string }[];
      socialLinks: SocialLink[];
      actions: Action[];
    };
    skills: {
      /** Retained in the type because the JSON still carries it; unused in the UI. */
      title: string;
      items: {
        icon: string;
        level: number;
        order: number;
        title: string;
        url: string;
      }[];
    };
    education: {
      title: string;
      items: {
        dateRange: string;
        description: string | null;
        institution: string;
        location: string;
        logo: string;
        title: string;
        url: string | null;
      }[];
    };
    experience: {
      title: string;
      items: {
        company: string;
        dateRange: string;
        details: string[];
        location: string;
        logo: string;
        order: number;
        title: string;
        url: string | null;
      }[];
    };
    youtubeVideos: {
      title: string;
      items: { order: number; thumbnail: string; title: string; url: string }[];
    };
    articles: {
      title: string;
      viewAll: { label: string; url: string };
      items: {
        title: string;
        url: string;
        coverImage: string;
        publishedAt: string;
        readTimeMinutes: number;
        views: number;
        pinned?: boolean;
        excerpt: string | null;
      }[];
    };
    projects: {
      title: string;
      items: {
        description: string;
        link: string;
        logo: string;
        order: number;
        tags: string[];
        title: string;
      }[];
    };
    awards: {
      title: string;
      items: {
        date: string;
        description: string;
        logo: string;
        order: number;
        organization: string;
        title: string;
        url: string | null;
      }[];
    };
    recommendations: {
      title: string;
      items: {
        author: { bio: string; image: string; name: string };
        body: string;
        title: string;
        url: string;
      }[];
    };
    connect: {
      title: string;
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
    signature: { type: string; owner: string };
    socialLinks: SocialLink[];
    actions: Action[];
    copyright: string;
  };
};

export const portfolio = portfolioJson as unknown as Portfolio;

export const sections = portfolio.sections;

/** Source order of the page's sections, including `intro`. */
export const sectionOrder = portfolio.sectionOrder;

/**
 * Titles keyed by section id, read structurally rather than through the typed
 * `sections` map. This is what lets the registry in `sections.tsx` resolve a
 * heading for a section that exists in the JSON but has not been added to the
 * `Portfolio` type yet.
 */
export const sectionTitles: Record<string, string> = Object.fromEntries(
  Object.entries(portfolio.sections as Record<string, { title?: string }>).map(
    ([id, section]) => [id, section?.title ?? id],
  ),
);

export const sortedExperience = [...sections.experience.items].sort(
  (a, b) => a.order - b.order,
);

export const sortedAwards = [...sections.awards.items].sort(
  (a, b) => a.order - b.order,
);

export const sortedVideos = [...sections.youtubeVideos.items].sort(
  (a, b) => a.order - b.order,
);

/**
 * Projects in authored order. Every project gets the same table row — the ledger
 * is the concept, so a featured band would break it.
 */
export const sortedProjects = [...sections.projects.items].sort(
  (a, b) => a.order - b.order,
);

/** Articles newest-first. The source order interleaves a pinned post. */
export const sortedArticles = [...sections.articles.items].sort(
  (a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
);

export const socialLinks = [...sections.intro.socialLinks].sort(
  (a, b) => a.order - b.order,
);

export const footerLinks = [...portfolio.footer.socialLinks].sort(
  (a, b) => a.order - b.order,
);

/** The most recent role, used as the intro's standfirst line. */
export const currentRole = sortedExperience[0];

const bookingAction = [
  ...sections.intro.actions,
  ...portfolio.footer.actions,
].find((action) => action.type === "calendar");

export const bookingUrl = bookingAction?.calendar
  ? `https://cal.com/${bookingAction.calendar.username}/${bookingAction.calendar.namespace}`
  : null;

/** Resume link, rendered only when the source data actually carries a URL. */
export const resumeUrl =
  [...sections.intro.actions, ...portfolio.footer.actions].find(
    (action) => action.label === "View Resume" && action.url,
  )?.url ?? null;

/**
 * The publication root. The source `viewAll.url` is a relative `/blogs` path
 * on the old site, which does not exist in this project, so the link is
 * derived from the articles' own absolute URLs instead.
 */
export const blogUrl = (() => {
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
 * taken as the start year. Falls back to the raw string if there is no year.
 */
export function startYear(value: string): string {
  return value.match(/\d{4}/)?.[0] ?? value.trim();
}

/** Source bullets are stored with a literal "- " prefix. */
export function cleanBullet(detail: string): string {
  return detail.replace(/^\s*-\s*/, "").trim();
}

/**
 * Whole years from a date range's start year to now, for the About summary.
 *
 * Rounded down to a year, since that is how a span of experience is spoken
 * about, and computed rather than written down so the sentence does not go stale.
 */
export function yearsSince(dateRange: string): number {
  const start = Number(startYear(dateRange));
  if (!Number.isFinite(start)) return 0;
  return Math.max(1, new Date().getUTCFullYear() - start);
}

/**
 * A company name cut to what a chip can carry inline.
 *
 * One source name is really two joined by a pipe ("ICT Division | Govt. of
 * Bangladesh"), which makes a chip twice the width of any other and dominates the
 * sentence it sits in. The panel still shows the full name, so nothing is lost.
 */
export function shortCompany(company: string): string {
  return company.split("|")[0].trim();
}

/**
 * A source date range as two short endpoints — `["Feb 22", "Sep 22"]`.
 *
 * Source ranges are long-hand and inconsistently punctuated ("October, 2022 -
 * Present", "September, 2021 – February, 2022 (Contractual)", "2019 - 2022"), and
 * were being printed in full inside the record while the left column showed only
 * the start year — the same date twice, in two different formats. This is the one
 * form both ends of a row can share.
 *
 * A range with no months keeps its years ("2019" – "2022"). An ongoing range ends
 * in "Now", which is shorter than "Present" and does not wrap. Any trailing
 * qualifier like "(Contract)" is dropped here: it belongs beside the role, not in
 * a date column, and `rangeQualifier` returns it separately.
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

/** A trailing "(Contract)" or "(Contractual)", which qualifies the role. */
export function rangeQualifier(dateRange: string): string | null {
  return dateRange.match(/\(([^)]+)\)/)?.[1] ?? null;
}

/** An ISO date as one short endpoint, for sections holding a single date. */
export function shortDate(iso: string): string {
  const date = new Date(iso);
  return `${MONTHS[date.getUTCMonth()]} ${String(date.getUTCFullYear()).slice(2)}`;
}

/**
 * A date range cut down to its years, for places too small for the source string.
 *
 * Source ranges are long-hand and inconsistent ("October, 2022 - Present",
 * "September, 2021 – February, 2022 (Contractual)"), which is fine in a table row
 * and far too long inside a chip panel. This keeps the years, collapses a range
 * that starts and ends in the same year to one, and keeps a trailing note like
 * "(Contract)" because it qualifies the role rather than decorating it.
 *
 * Falls back to the original string if no year can be found, on the principle
 * that showing the raw value beats showing nothing.
 */
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
