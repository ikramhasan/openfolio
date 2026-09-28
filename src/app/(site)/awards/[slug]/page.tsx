import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getAwards,
  getBody,
  tagFor,
  writtenParams,
} from "../../../_components/content";
import { longDate } from "../../../_components/data";
import { isoDate, pageMetadata } from "../../../_components/seo";
import { WorkJsonLd } from "../../../_components/structured-data";
import { slugOf } from "../../../_components/writing";
import { Outbound, Written } from "../../../_components/written";

export function generateStaticParams() {
  return writtenParams("awards");
}

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

  return pageMetadata({
    title: item.title,
    description: item.description,
    path: `/awards/${slug}`,
    type: "article",
    publishedTime: isoDate(item.date),
    section: "Awards",
  });
}

export default function AwardPage({ params }: PageProps<"/awards/[slug]">) {
  return (
    <Suspense>
      <CachedAward params={params} />
    </Suspense>
  );
}

async function CachedAward({
  params,
}: {
  params: PageProps<"/awards/[slug]">["params"];
}) {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("awards"));

  const { slug } = await params;

  const [item, body] = await Promise.all([
    award(slug),
    getBody("awards", slug),
  ]);
  if (!item || !body) notFound();

  return (
    <>
      <WorkJsonLd
        title={item.title}
        description={item.description}
        path={`/awards/${slug}`}
        link={item.url}
        section="awards"
      />
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
    </>
  );
}
