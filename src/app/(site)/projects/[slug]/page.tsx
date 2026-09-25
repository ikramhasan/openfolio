import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getBody,
  getProjects,
  tagFor,
  writtenParams,
} from "../../../_components/content";
import { formatTags } from "../../../_components/data";
import { slugOf } from "../../../_components/writing";
import { Outbound, Written } from "../../../_components/written";

export function generateStaticParams() {
  return writtenParams("projects");
}

async function project(slug: string) {
  const { items } = await getProjects();
  return items.find((item) => slugOf(item) === slug) ?? null;
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await project(slug);

  if (!item) return {};

  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.description,
      url: `/projects/${slug}`,
    },
  };
}

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <Suspense>
      <CachedProject params={params} />
    </Suspense>
  );
}

async function CachedProject({
  params,
}: {
  params: PageProps<"/projects/[slug]">["params"];
}) {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("projects"));

  const { slug } = await params;

  const [item, body] = await Promise.all([
    project(slug),
    getBody("projects", slug),
  ]);
  if (!item || !body) notFound();

  const tags = formatTags(item.tags);

  return (
    <Written
      title={item.title}
      standfirst={item.description}
      meta={
        <>
          {tags}
          {tags && item.link ? <span aria-hidden="true"> · </span> : null}
          {item.link ? <Outbound href={item.link} label="Visit" /> : null}
        </>
      }
      body={body}
      back={{ href: "/projects", label: "Projects" }}
    />
  );
}
