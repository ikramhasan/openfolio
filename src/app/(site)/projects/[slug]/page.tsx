import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getBody, getProjects, tagFor } from "../../../_components/content";
import { formatTags } from "../../../_components/data";
import { slugOf } from "../../../_components/writing";
import { Outbound, Written } from "../../../_components/written";

/**
 * A project written here, at its own URL under the Projects section. The same
 * arrangement as a post — see `articles/[slug]` for why the segment is static, why
 * there is no `generateStaticParams`, and why a missing body is a streamed 404.
 */
export const instant = false;

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

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;

  const [item, body] = await Promise.all([
    project(slug),
    getBody("projects", slug),
  ]);
  if (!item || !body) notFound();

  return <CachedProject slug={slug} />;
}

async function CachedProject({ slug }: { slug: string }) {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("projects"));

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
