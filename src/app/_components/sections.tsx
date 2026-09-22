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
 * The section registry. Each entry becomes a rail item and a route.
 *
 * Adding a section: write the component, add an entry to `REGISTRY`. Ordering
 * comes from `sectionOrder` in the JSON, except `lead: true` which pins to the
 * front. Anything registered but unsequenced is appended.
 */

export type SectionEntry = {
  /** Matches the key under `sections` in `data/portfolio.json`. */
  id: string;
  title?: string;
  /** Shorter wording for the rail. Falls back to the title. */
  navLabel?: string;
  /** URL segment, where the id reads badly. Ignored for the lead section. */
  slug?: string;
  /** One-line gloss under the panel heading. */
  note?: string;
  body: ReactNode;
  /** Trailing element on the panel's heading row. */
  aside?: ReactNode;
  /** Pins ahead of the data-ordered entries. */
  lead?: boolean;
};

// In the JSON but deliberately not rendered as sections: `intro` is the masthead,
// `skills` was dropped, `connect` moved to the footer.
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

export const pageSections: SectionEntry[] = (() => {
  const lead = REGISTRY.filter((entry) => entry.lead);

  const ordered = sectionOrder
    .map((id) => byId.get(id))
    .filter((entry): entry is SectionEntry => Boolean(entry) && !entry?.lead);

  const seen = new Set([...lead, ...ordered].map((entry) => entry.id));
  const unsequenced = REGISTRY.filter((entry) => !seen.has(entry.id));

  return [...lead, ...ordered, ...unsequenced];
})();

export function sectionTitle(entry: SectionEntry): string {
  return entry.title ?? sectionTitles[entry.id] ?? entry.id;
}

// The first section answers for `/` rather than a path of its own, so promoting a
// different one moves the home page with it.
const homeId = pageSections[0].id;

export function isHome(entry: SectionEntry): boolean {
  return entry.id === homeId;
}

export function sectionSegments(entry: SectionEntry): string[] {
  return isHome(entry) ? [] : [entry.slug ?? entry.id];
}

export function sectionPath(entry: SectionEntry): string {
  return `/${sectionSegments(entry).join("/")}`;
}

export const sectionByPath = new Map(
  pageSections.map((entry) => [sectionPath(entry), entry]),
);

export const navItems = pageSections.map((entry, index) => ({
  href: sectionPath(entry),
  label: entry.navLabel ?? sectionTitle(entry),
  index: String(index + 1).padStart(2, "0"),
}));

// Last in the file deliberately: these call helpers that close over `homeId`, so
// running them earlier would read it before initialisation.
if (process.env.NODE_ENV !== "production") {
  const missing = sectionOrder.filter(
    (id) => !byId.has(id) && !STANDALONE_IDS.has(id),
  );

  if (missing.length > 0) {
    console.warn(
      `Section(s) present in portfolio.json but not registered in _components/sections.tsx: ${missing.join(", ")}. They will not render.`,
    );
  }

  const paths = pageSections.map((entry) => sectionPath(entry));
  const duplicates = paths.filter((path, i) => paths.indexOf(path) !== i);

  if (duplicates.length > 0) {
    console.warn(
      `Duplicate section route(s) in _components/sections.tsx: ${[...new Set(duplicates)].join(", ")}. Only the first will be reachable.`,
    );
  }
}
