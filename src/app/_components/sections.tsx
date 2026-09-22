import type { ReactNode } from "react";
import { About } from "./about";
import { Articles, ArticlesAside } from "./articles";
import { Awards } from "./awards";
import { sectionOrder, sectionTitles } from "./data";
import { Education } from "./education";
import { Experience } from "./experience";
import { Projects } from "./projects";
import { Recommendations } from "./recommendations";
import { Videos } from "./videos";

/**
 * The section registry.
 *
 * Each entry resolves to an item in the rail and a route of its own — `/` for the
 * section that leads, then `/experience`, `/projects` and the rest. To add a
 * section — "tools", "travels", "reading" — write the component and add one entry
 * to `REGISTRY` below. The rail, the numbering, the route and its static params
 * all follow; no file under `app/[[...section]]` needs to change.
 *
 * Ordering comes from `sectionOrder` in `data/portfolio.json`, so sequence is a
 * data decision, not a code one. One exception, marked on the entry: `lead: true`
 * pins a tab to the front regardless of the data. About uses it because it is
 * assembled here rather than being a section in the JSON. Anything registered
 * but missing from `sectionOrder` is appended in registry order, which keeps a
 * new section reachable even before the JSON is updated.
 */

export type SectionEntry = {
  /** Matches the key under `sections` in `data/portfolio.json`. */
  id: string;
  /** Overrides the source `title`. Rarely needed. */
  title?: string;
  /** Shorter wording for the rail. Falls back to the title. */
  navLabel?: string;
  /**
   * The URL segment, when the id would make a poor one. Falls back to the id,
   * which is why most entries leave this out. Ignored for the leading section,
   * which answers for `/`.
   */
  slug?: string;
  /**
   * A one-line gloss set beneath the panel heading. Optional, and worth
   * skipping when the heading is already self-explanatory.
   */
  note?: string;
  body: ReactNode;
  /** Optional trailing element on the panel's heading row. */
  aside?: ReactNode;
  /** Pins the tab ahead of the data-ordered ones. */
  lead?: boolean;
};

/**
 * Sections in the JSON that have no section of their own, so the dev-time warning
 * below does not flag them as unregistered.
 *
 * `intro` is the masthead. `skills` is no longer rendered at all: three
 * self-assessed percentages said less about the work than the summary in the
 * About panel does, so the data is left in place and unused. `connect` moved to
 * the footer — one form and two links did not earn a section beside Experience
 * and Projects, and contact is what a reader looks for at the bottom of a page.
 */
const STANDALONE_IDS = new Set(["intro", "skills", "connect"]);

const REGISTRY: SectionEntry[] = [
  {
    id: "about",
    title: "About",
    lead: true,
    body: <About />,
  },
  {
    id: "experience",
    note: "Four roles, most recent first.",
    body: <Experience />,
  },
  {
    id: "projects",
    note: "Shipped work and technical studies.",
    body: <Projects />,
  },
  { id: "articles", body: <Articles />, aside: <ArticlesAside /> },
  {
    id: "youtubeVideos",
    navLabel: "Video",
    slug: "videos",
    body: <Videos />,
  },
  { id: "education", body: <Education /> },
  { id: "awards", body: <Awards /> },
  {
    id: "recommendations",
    navLabel: "References",
    slug: "references",
    body: <Recommendations />,
  },
];

const byId = new Map(REGISTRY.map((entry) => [entry.id, entry]));

/**
 * Sections in final order: `lead` entries first, then `sectionOrder`, then
 * anything registered that the data has not sequenced yet. The first one is the
 * home page.
 */
export const pageSections: SectionEntry[] = (() => {
  const lead = REGISTRY.filter((entry) => entry.lead);

  const ordered = sectionOrder
    .map((id) => byId.get(id))
    .filter((entry): entry is SectionEntry => Boolean(entry) && !entry?.lead);

  const seen = new Set([...lead, ...ordered].map((entry) => entry.id));
  const unsequenced = REGISTRY.filter((entry) => !seen.has(entry.id));

  return [...lead, ...ordered, ...unsequenced];
})();

/** Resolves a section's heading. Registry override wins over the source title. */
export function sectionTitle(entry: SectionEntry): string {
  return entry.title ?? sectionTitles[entry.id] ?? entry.id;
}

/**
 * The section that *is* the home page.
 *
 * The first section in resolved order answers for `/` rather than living at a
 * path of its own — there is no landing page above the sections, so the one the
 * site opens on is the site's root. About holds the position by way of
 * `lead: true`; promoting a different section moves `/` with it and no URL is
 * spelled out anywhere to keep in step.
 */
const homeId = pageSections[0].id;

export function isHome(entry: SectionEntry): boolean {
  return entry.id === homeId;
}

/**
 * The section's URL segments — none for the home section, one otherwise. This is
 * what `generateStaticParams` hands the catch-all route.
 *
 * Ids are data keys and a few of them read badly in a URL (`youtubeVideos`), so
 * an entry may name its own slug.
 */
export function sectionSegments(entry: SectionEntry): string[] {
  return isHome(entry) ? [] : [entry.slug ?? entry.id];
}

/** The section's route. The only place a section URL is assembled. */
export function sectionPath(entry: SectionEntry): string {
  return `/${sectionSegments(entry).join("/")}`;
}

/**
 * Entries keyed by route, for the page to resolve the URL it was given. The home
 * section sits under `/`, matching `usePathname` in the rail and the empty
 * catch-all param.
 */
export const sectionByPath = new Map(
  pageSections.map((entry) => [sectionPath(entry), entry]),
);

/**
 * Rail items, numbered in resolved order. The number is positional, so
 * inserting a section renumbers the rest for free.
 */
export const navItems = pageSections.map((entry, index) => ({
  href: sectionPath(entry),
  label: entry.navLabel ?? sectionTitle(entry),
  index: String(index + 1).padStart(2, "0"),
}));

/*
 * Dev-time registry checks.
 *
 * Last in the file deliberately: these call the helpers above, and the helpers
 * close over `homeId`, so running them any earlier reads a `const` that has not
 * been initialised yet. Function declarations hoist; their dependencies do not.
 */
if (process.env.NODE_ENV !== "production") {
  const missing = sectionOrder.filter(
    (id) => !byId.has(id) && !STANDALONE_IDS.has(id),
  );

  if (missing.length > 0) {
    console.warn(
      `Section(s) present in portfolio.json but not registered in _components/sections.tsx: ${missing.join(", ")}. They will not render.`,
    );
  }

  // Two sections resolving to the same URL would silently hide one of them.
  const paths = pageSections.map((entry) => sectionPath(entry));
  const duplicates = paths.filter((path, i) => paths.indexOf(path) !== i);

  if (duplicates.length > 0) {
    console.warn(
      `Duplicate section route(s) in _components/sections.tsx: ${[...new Set(duplicates)].join(", ")}. Only the first will be reachable.`,
    );
  }
}
