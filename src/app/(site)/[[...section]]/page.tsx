import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Panel } from "../../_components/panel";
import { routedSections, sectionForPath } from "../../_components/sections";

/**
 * One section per route: `/` for the lead section, then `/experience` and the rest.
 * An optional catch-all rather than `[section]`, so the lead section can be `/`
 * itself instead of redirecting there. The registry supplies the full list.
 */

export async function generateStaticParams() {
  const sections = await routedSections();

  return sections.map((entry) => ({
    section: entry.home ? [] : entry.path.slice(1).split("/"),
  }));
}

// Sections are a closed set, so an unknown path 404s from `notFound()` below.
// (`dynamicParams = false` would have refused it a render at all, but Cache
// Components does not allow that segment config.)

function pathOf(segments: string[] | undefined): string {
  return `/${(segments ?? []).join("/")}`;
}

export async function generateMetadata({
  params,
}: PageProps<"/[[...section]]">): Promise<Metadata> {
  const { section } = await params;
  const entry = await sectionForPath(pathOf(section));

  if (!entry) return {};

  // The home section keeps the layout's site-wide title.
  if (entry.home) return { alternates: { canonical: "/" } };

  return {
    title: entry.title,
    ...(entry.note ? { description: entry.note } : {}),
    alternates: { canonical: entry.path },
    openGraph: {
      title: entry.title,
      ...(entry.note ? { description: entry.note } : {}),
      url: entry.path,
    },
  };
}

export default async function SectionPage({
  params,
}: PageProps<"/[[...section]]">) {
  const { section } = await params;
  const path = pathOf(section);
  const entry = await sectionForPath(path);

  if (!entry) notFound();

  return <CachedSection path={path} />;
}

/**
 * The cached half, separated so the tags can be looked up before the entry is
 * filled: a cached scope is keyed by its arguments, and `cacheTag` has to be
 * called inside it.
 */
async function CachedSection({ path }: { path: string }) {
  "use cache";
  cacheLife("max");

  const entry = await sectionForPath(path);
  if (!entry) notFound();

  cacheTag(...entry.tags);

  return (
    <Panel title={entry.title} note={entry.note} aside={entry.aside}>
      {entry.body}
    </Panel>
  );
}
