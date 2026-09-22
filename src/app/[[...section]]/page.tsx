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
 * One section per route: `/` for the lead section, then `/experience` and the
 * rest. An optional catch-all rather than `[section]`, so the lead section can be
 * `/` itself instead of redirecting there. The registry supplies the full list.
 */

export function generateStaticParams() {
  return pageSections.map((entry) => ({ section: sectionSegments(entry) }));
}

// Sections are a closed set, so an unknown path is a 404. Also stops the
// catch-all swallowing deep paths like `/about/x`.
export const dynamicParams = false;

function pathOf(segments: string[] | undefined): string {
  return `/${(segments ?? []).join("/")}`;
}

export async function generateMetadata({
  params,
}: PageProps<"/[[...section]]">): Promise<Metadata> {
  const { section } = await params;
  const entry = sectionByPath.get(pathOf(section));

  if (!entry) return {};

  // The home section keeps the layout's site-wide title.
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
