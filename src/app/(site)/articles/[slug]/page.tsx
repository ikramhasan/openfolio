import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getArticles,
  getBody,
  tagFor,
  writtenParams,
} from "../../../_components/content";
import { formatCount, longDate } from "../../../_components/data";
import { bodyExcerpt, isoDate, pageMetadata } from "../../../_components/seo";
import { ArticleJsonLd } from "../../../_components/structured-data";
import { slugOf } from "../../../_components/writing";
import { Written } from "../../../_components/written";

export function generateStaticParams() {
  return writtenParams("articles");
}

async function post(slug: string) {
  const { items } = await getArticles();
  return items.find((item) => slugOf(item) === slug) ?? null;
}

async function summary(slug: string, excerpt: string | null) {
  return excerpt?.trim() || bodyExcerpt(await getBody("articles", slug));
}

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await post(slug);

  if (!article) return {};

  return pageMetadata({
    title: article.title,
    description: await summary(slug, article.excerpt),
    path: `/articles/${slug}`,
    type: "article",
    publishedTime: isoDate(article.publishedAt),
    section: "Articles",
  });
}

export default function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  return (
    <Suspense>
      <CachedArticle params={params} />
    </Suspense>
  );
}

async function CachedArticle({
  params,
}: {
  params: PageProps<"/articles/[slug]">["params"];
}) {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("articles"));

  const { slug } = await params;

  const [article, body] = await Promise.all([
    post(slug),
    getBody("articles", slug),
  ]);
  if (!article || !body) notFound();

  return (
    <>
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt?.trim() || bodyExcerpt(body)}
        path={`/articles/${slug}`}
        publishedAt={article.publishedAt}
        image={article.coverImage}
        section="articles"
      />
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
    </>
  );
}
