import type { ReactNode } from "react";
import { About } from "./about";
import { Articles, ArticlesAside } from "./articles";
import { Awards } from "./awards";
import { type CacheKey, getNav, tagFor } from "./content";
import { Education } from "./education";
import { Experience } from "./experience";
import { Projects } from "./projects";
import { Recommendations } from "./recommendations";
import type { Nav } from "./types";
import { Videos } from "./videos";

/**
 * The section registry. Each entry becomes a rail item and a route.
 *
 * Adding a section: write the component, add an entry to `REGISTRY`, and list the
 * sections it reads in `reads`. Ordering comes from the stored `sectionOrder`,
 * except `lead: true` which pins to the front. Anything registered but unsequenced
 * is appended. Headings, subtitles and rail labels are stored content, not written
 * here.
 *
 * `reads` is what makes a save invalidate the right routes: the page tags its own
 * cache entry with these, so editing Experience refreshes `/experience` and the
 * About panel that quotes it, and nothing else.
 */

export type SectionEntry = {
  /** Matches the section key in the stored content. */
  id: string;
  /** URL segment, where the id reads badly. Ignored for the lead section. */
  slug?: string;
  body: ReactNode;
  /** Trailing element on the panel's heading row. */
  aside?: ReactNode;
  /** Pins ahead of the data-ordered entries. */
  lead?: boolean;
  /** Cache keys this section's body reaches, directly or through a child. */
  reads: CacheKey[];
};

// Stored as sections but not rendered as one: `intro` is the masthead, `skills`
// was dropped, `connect` moved to the footer.
const STANDALONE_IDS = new Set(["intro", "skills", "connect"]);

const REGISTRY: SectionEntry[] = [
  {
    id: "about",
    lead: true,
    body: <About />,
    // The prose is composed from the roles, and the photo strip from the intro.
    reads: ["about", "experience", "intro"],
  },
  { id: "experience", body: <Experience />, reads: ["experience"] },
  { id: "projects", body: <Projects />, reads: ["projects"] },
  {
    id: "articles",
    body: <Articles />,
    aside: <ArticlesAside />,
    reads: ["articles"],
  },
  {
    id: "youtubeVideos",
    slug: "videos",
    body: <Videos />,
    reads: ["youtubeVideos"],
  },
  { id: "education", body: <Education />, reads: ["education"] },
  { id: "awards", body: <Awards />, reads: ["awards"] },
  {
    id: "recommendations",
    slug: "references",
    body: <Recommendations />,
    reads: ["recommendations"],
  },
];

const byId = new Map(REGISTRY.map((entry) => [entry.id, entry]));

export type RoutedSection = SectionEntry & {
  path: string;
  /** Answers for `/` rather than a path of its own. */
  home: boolean;
  title: string;
  note?: string;
  navLabel: string;
  /** Rail numbering, "01" upward. */
  index: string;
  /** Every tag the route's own cache entry depends on. */
  tags: string[];
};

function segmentsOf(entry: SectionEntry, home: boolean): string[] {
  return home ? [] : [entry.slug ?? entry.id];
}

function route(entry: SectionEntry, nav: Nav, position: number): RoutedSection {
  const heading = nav.byKey[entry.id];
  const title = heading?.title ?? entry.id;
  const home = position === 0;

  return {
    ...entry,
    path: `/${segmentsOf(entry, home).join("/")}`,
    home,
    title,
    ...(heading?.note ? { note: heading.note } : {}),
    navLabel: heading?.navLabel || title,
    index: String(position + 1).padStart(2, "0"),
    tags: [tagFor("nav"), ...entry.reads.map(tagFor)],
  };
}

/**
 * The sections the site routes to, in order. Not cached itself — it holds React
 * elements — but the nav read inside it is.
 */
export async function routedSections(): Promise<RoutedSection[]> {
  const nav = await getNav();

  const lead = REGISTRY.filter((entry) => entry.lead);

  const ordered = nav.order
    .map((id) => byId.get(id))
    .filter((entry): entry is SectionEntry => Boolean(entry) && !entry?.lead);

  const seen = new Set([...lead, ...ordered].map((entry) => entry.id));
  const unsequenced = REGISTRY.filter((entry) => !seen.has(entry.id));

  const sequence = [...lead, ...ordered, ...unsequenced];

  if (process.env.NODE_ENV !== "production") {
    warnOnGaps(nav, sequence);
  }

  return sequence.map((entry, position) => route(entry, nav, position));
}

export async function sectionForPath(
  path: string,
): Promise<RoutedSection | undefined> {
  return (await routedSections()).find((entry) => entry.path === path);
}

export async function navItems() {
  return (await routedSections()).map((entry) => ({
    href: entry.path,
    label: entry.navLabel,
    index: entry.index,
  }));
}

function warnOnGaps(nav: Nav, sequence: SectionEntry[]): void {
  const missing = nav.order.filter(
    (id) => !byId.has(id) && !STANDALONE_IDS.has(id),
  );

  if (missing.length > 0) {
    console.warn(
      `Section(s) in the stored content but not registered in _components/sections.tsx: ${missing.join(", ")}. They will not render.`,
    );
  }

  const paths = sequence.map((entry, position) =>
    segmentsOf(entry, position === 0).join("/"),
  );
  const duplicates = paths.filter((path, i) => paths.indexOf(path) !== i);

  if (duplicates.length > 0) {
    console.warn(
      `Duplicate section route(s) in _components/sections.tsx: ${[...new Set(duplicates)].join(", ")}. Only the first will be reachable.`,
    );
  }
}
