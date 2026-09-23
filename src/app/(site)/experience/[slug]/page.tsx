import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getBody, getExperience, tagFor } from "../../../_components/content";
import { cleanBullet } from "../../../_components/data";
import { slugOf } from "../../../_components/writing";
import { Outbound, Written } from "../../../_components/written";

export const instant = false;

async function role(slug: string) {
  const { items } = await getExperience();
  return items.find((item) => slugOf(item) === slug) ?? null;
}

export async function generateMetadata({
  params,
}: PageProps<"/experience/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await role(slug);

  if (!item) return {};

  const description = `${item.title} at ${item.company}, ${item.dateRange}.`;

  return {
    title: `${item.title} · ${item.company}`,
    description,
    alternates: { canonical: `/experience/${slug}` },
    openGraph: {
      type: "article",
      title: `${item.title} · ${item.company}`,
      description,
      url: `/experience/${slug}`,
    },
  };
}

export default async function RolePage({
  params,
}: PageProps<"/experience/[slug]">) {
  const { slug } = await params;

  const [item, body] = await Promise.all([
    role(slug),
    getBody("experience", slug),
  ]);
  if (!item || !body) notFound();

  return <CachedRole slug={slug} />;
}

async function CachedRole({ slug }: { slug: string }) {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("experience"));

  const [item, body] = await Promise.all([
    role(slug),
    getBody("experience", slug),
  ]);
  if (!item || !body) notFound();

  return (
    <Written
      title={item.title}
      meta={
        <>
          {item.company}
          <span aria-hidden="true"> · </span>
          {item.location.trim()}
          <span aria-hidden="true"> · </span>
          {item.dateRange}
          {item.url ? (
            <>
              <span aria-hidden="true"> · </span>
              <Outbound href={item.url} label="Company" />
            </>
          ) : null}
        </>
      }
      intro={
        item.details.length > 0 ? (
          <ul className="max-w-[72ch] space-y-1.5">
            {item.details.map((detail) => {
              const text = cleanBullet(detail);

              return (
                <li key={text} className="pf-body flex gap-2.5">
                  <span aria-hidden="true" className="pf-faint select-none">
                    ·
                  </span>
                  <span>{text}</span>
                </li>
              );
            })}
          </ul>
        ) : null
      }
      body={body}
      back={{ href: "/experience", label: "Experience" }}
    />
  );
}
