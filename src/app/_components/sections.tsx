import type { ReactNode } from "react";
import { About } from "./about";
import { Articles, ArticlesAside } from "./articles";
import { Awards } from "./awards";
import { type CacheKey, getNav, tagFor } from "./content";
import { Education } from "./education";
import { Experience } from "./experience";
import { Music } from "./music";
import { OpenSource } from "./open-source";
import { Projects } from "./projects";
import { Recommendations } from "./recommendations";
import { Tools } from "./tools";
import type { Nav } from "./types";
import { Videos } from "./videos";

export type SectionEntry = {
  id: string;
  slug?: string;
  body: ReactNode;
  aside?: ReactNode;
  lead?: boolean;
  reads: CacheKey[];
};

const STANDALONE_IDS = new Set(["intro", "skills", "connect"]);

const REGISTRY: SectionEntry[] = [
  {
    id: "about",
    lead: true,
    body: <About />,
    reads: ["about", "experience", "intro"],
  },
  { id: "experience", body: <Experience />, reads: ["experience"] },
  { id: "projects", body: <Projects />, reads: ["projects"] },
  { id: "tools", body: <Tools />, reads: ["tools"] },
  { id: "music", body: <Music />, reads: ["music"] },
  {
    id: "openSource",
    slug: "open-source",
    body: <OpenSource />,
    reads: ["openSource"],
  },
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
  home: boolean;
  title: string;
  note?: string;
  navLabel: string;
  index: string;
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
