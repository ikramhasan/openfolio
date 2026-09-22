import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Panel } from "../_components/panel";
import {
  isHome,
  pageSections,
  sectionByPath,
  sectionSegments,
  sectionTitle,
} from "../_components/sections";

/**
 * One section, one route: `/` for the section that leads — About — then
 * `/experience`, `/projects` and the rest.
 *
 * Every section is served by this one optional catch-all rather than a folder
 * each, because the registry in `_components/sections.tsx` already knows the full
 * list. An optional catch-all rather than `[section]` so the home section can be
 * `/` itself instead of redirecting there: the site opens on a real page, not a
 * hop. Adding a section to the registry adds its URL here for free, including its
 * entry in `generateStaticParams`, so it is prerendered with the rest.
 *
 * The shell around this — rail, masthead, footer — is the root layout, so
 * navigating between sections re-renders only what follows.
 */

/**
 * Prerender every section at build time; the set is known and small. The home
 * section contributes no segments, which is how `/` gets generated.
 */
export function generateStaticParams() {
  return pageSections.map((entry) => ({ section: sectionSegments(entry) }));
}

/**
 * Anything outside that list is a 404 rather than a render attempt. The sections
 * are a closed set, so an unknown path is a wrong URL, not a missing record. This
 * is also what stops the catch-all from swallowing deep paths like `/about/x`.
 */
export const dynamicParams = false;

/** The path this route was asked for, rebuilt from the catch-all segments. */
function pathOf(segments: string[] | undefined): string {
  return `/${(segments ?? []).join("/")}`;
}

export async function generateMetadata({
  params,
}: PageProps<"/[[...section]]">): Promise<Metadata> {
  const { section } = await params;
  const entry = sectionByPath.get(pathOf(section));

  if (!entry) return {};

  /*
   * The home section keeps the layout's site-wide title. Prefixing it would read
   * as "About | Ikramul Hasan" on the page that *is* the site.
   */
  if (isHome(entry)) return {};

  return {
    title: sectionTitle(entry),
    ...(entry.note ? { description: entry.note } : {}),
  };
}

export default async function SectionPage({
  params,
}: PageProps<"/[[...section]]">) {
  const { section } = await params;
  const entry = sectionByPath.get(pathOf(section));

  if (!entry) notFound();

  return (
    <Panel title={sectionTitle(entry)} note={entry.note} aside={entry.aside}>
      {entry.body}
    </Panel>
  );
}
