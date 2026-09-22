import type { ReactNode } from "react";
import { About } from "./about";
import { Articles, ArticlesAside } from "./articles";
import { Awards } from "./awards";
import { Connect } from "./connect";
import { sectionOrder, sectionTitles } from "./data";
import { Education } from "./education";
import { Experience } from "./experience";
import { Projects } from "./projects";
import { Recommendations } from "./recommendations";
import { Videos } from "./videos";

/**
 * The section registry.
 *
 * Each entry resolves to a tab in the rail and a panel beside it. To add a
 * section — "tools", "travels", "reading" — write the component and add one entry
 * to `REGISTRY` below. The rail, the numbering and the panel all follow; nothing
 * in `page.tsx` needs to change.
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
 * Sections in the JSON that no longer have a tab of their own, so the dev-time
 * warning below does not flag them as unregistered.
 *
 * `intro` was never a tab. `skills` is rendered inside the About panel instead:
 * it is three rows, and a tab of its own would be the shortest panel on the page
 * by a wide margin.
 */
const STANDALONE_IDS = new Set(["intro", "skills"]);

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
  { id: "youtubeVideos", navLabel: "Video", body: <Videos /> },
  { id: "education", body: <Education /> },
  { id: "awards", body: <Awards /> },
  {
    id: "recommendations",
    navLabel: "References",
    body: <Recommendations />,
  },
  { id: "connect", navLabel: "Contact", body: <Connect /> },
];

const byId = new Map(REGISTRY.map((entry) => [entry.id, entry]));

/**
 * Tabs in final order: `lead` entries first, then `sectionOrder`, then anything
 * registered that the data has not sequenced yet.
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

if (process.env.NODE_ENV !== "production") {
  const missing = sectionOrder.filter(
    (id) => !byId.has(id) && !STANDALONE_IDS.has(id),
  );

  if (missing.length > 0) {
    console.warn(
      `Section(s) present in portfolio.json but not registered in _components/sections.tsx: ${missing.join(", ")}. They will not render.`,
    );
  }
}

/** Resolves a section's heading. Registry override wins over the source title. */
export function sectionTitle(entry: SectionEntry): string {
  return entry.title ?? sectionTitles[entry.id] ?? entry.id;
}

/**
 * Rail items, numbered in resolved order. The number is positional, so
 * inserting a section renumbers the rest for free.
 */
export const navItems = pageSections.map((entry, index) => ({
  id: entry.id,
  label: entry.navLabel ?? sectionTitle(entry),
  index: String(index + 1).padStart(2, "0"),
}));

/**
 * The tab shown on first load, and the fallback for an unknown URL hash — About,
 * which `lead: true` pins to the front.
 */
export const defaultTabId = pageSections[0].id;
