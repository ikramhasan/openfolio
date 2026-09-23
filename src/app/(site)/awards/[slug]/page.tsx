import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getAwards, getBody, tagFor } from "../../../_components/content";
import { longDate } from "../../../_components/data";
import { slugOf } from "../../../_components/writing";
import { Outbound, Written } from "../../../_components/written";

export const instant = false;

async function award(slug: string) {
  const { items } = await getAwards();
  return items.find((item) => slugOf(item) === slug) ?? null;
}

export async function generateMetadata({
  params,
}: PageProps<"/awards/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await award(slug);

  if (!item) return {};

  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: `/awards/${slug}` },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.description,
      url: `/awards/${slug}`,
      publishedTime: item.date,
    },
  };
}

export default async function AwardPage({
  params,
}: PageProps<"/awards/[slug]">) {
  const { slug } = await params;

  const [item, body] = await Promise.all([
    award(slug),
    getBody("awards", slug),
  ]);
  if (!item || !body) notFound();

  return <CachedAward slug={slug} />;
}

async function CachedAward({ slug }: { slug: string }) {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("awards"));

  const [item, body] = await Promise.all([
    award(slug),
    getBody("awards", slug),
  ]);
  if (!item || !body) notFound();

  return (
    <Written
      title={item.title}
      standfirst={item.description}
      meta={
        <>
          {item.organization}
          <span aria-hidden="true"> · </span>
          <time dateTime={item.date}>{longDate(item.date)}</time>
          {item.url ? (
            <>
              <span aria-hidden="true"> · </span>
              <Outbound href={item.url} label="Announcement" />
            </>
          ) : null}
        </>
      }
      body={body}
      back={{ href: "/awards", label: "Awards" }}
    />
  );
}
