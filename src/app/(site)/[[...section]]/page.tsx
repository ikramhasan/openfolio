import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Panel } from "../../_components/panel";
import { routedSections, sectionForPath } from "../../_components/sections";

export const instant = false;

export async function generateStaticParams() {
  const sections = await routedSections();

  return sections.map((entry) => ({
    section: entry.home ? [] : entry.path.slice(1).split("/"),
  }));
}

function pathOf(segments: string[] | undefined): string {
  return `/${(segments ?? []).join("/")}`;
}

export async function generateMetadata({
  params,
}: PageProps<"/[[...section]]">): Promise<Metadata> {
  const { section } = await params;
  const entry = await sectionForPath(pathOf(section));

  if (!entry) return {};

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
