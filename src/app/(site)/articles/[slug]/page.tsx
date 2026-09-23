import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getArticles, getBody, tagFor } from "../../../_components/content";
import { formatCount, longDate } from "../../../_components/data";
import { slugOf } from "../../../_components/writing";
import { Written } from "../../../_components/written";

export const instant = false;

async function post(slug: string) {
  const { items } = await getArticles();
  return items.find((item) => slugOf(item) === slug) ?? null;
}

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await post(slug);

  if (!article) return {};

  const description = article.excerpt ?? undefined;

  return {
    title: article.title,
    ...(description ? { description } : {}),
    alternates: { canonical: `/articles/${slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      ...(description ? { description } : {}),
      url: `/articles/${slug}`,
      publishedTime: article.publishedAt,
      ...(article.coverImage ? { images: [article.coverImage] } : {}),
    },
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/articles/[slug]">) {
  const { slug } = await params;

  const [article, body] = await Promise.all([
    post(slug),
    getBody("articles", slug),
  ]);
  if (!article || !body) notFound();

  return <CachedArticle slug={slug} />;
}

async function CachedArticle({ slug }: { slug: string }) {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("articles"));

  const [article, body] = await Promise.all([
    post(slug),
    getBody("articles", slug),
  ]);
  if (!article || !body) notFound();

  return (
    <Written
      title={article.title}
      standfirst={article.excerpt}
      cover={article.coverImage}
      meta={
        <>
          <time dateTime={article.publishedAt}>
            {longDate(article.publishedAt)}
          </time>
          <span aria-hidden="true"> · </span>
          {article.readTimeMinutes} min read
          <span aria-hidden="true"> · </span>
          {formatCount(article.views)} views
        </>
      }
      body={body}
      back={{ href: "/articles", label: "Articles" }}
    />
  );
}
