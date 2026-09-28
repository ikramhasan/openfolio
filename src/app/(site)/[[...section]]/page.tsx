import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Masthead } from "../../_components/masthead";
import { Panel } from "../../_components/panel";
import { routedSections, sectionForPath } from "../../_components/sections";
import { identity, ogImagePath, pageMetadata } from "../../_components/seo";
import { HomeJsonLd } from "../../_components/structured-data";

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

  const { site, intro, name } = await identity();

  if (entry.home) {
    return pageMetadata({
      title: site.title,
      description: site.description || intro.bio,
      path: "/",
      type: "profile",
      absoluteTitle: true,
      image: { url: ogImagePath("/"), alt: site.title },
    });
  }

  return pageMetadata({
    title: entry.title,
    description: entry.note ?? `${entry.title}, from the portfolio of ${name}.`,
    path: entry.path,
    image: { url: ogImagePath(entry.path), alt: entry.title },
  });
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

  if (entry.home) {
    return (
      <>
        <HomeJsonLd />
        <Masthead />

        <Panel title={entry.title} note={entry.note} aside={entry.aside} lead>
          {entry.body}
        </Panel>
      </>
    );
  }

  return (
    <Panel title={entry.title} note={entry.note} aside={entry.aside}>
      {entry.body}
    </Panel>
  );
}
