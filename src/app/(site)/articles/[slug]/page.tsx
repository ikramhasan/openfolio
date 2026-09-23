import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getArticles, getBody, tagFor } from "../../../_components/content";
import { formatCount, longDate } from "../../../_components/data";
import { slugOf } from "../../../_components/writing";
import { Written } from "../../../_components/written";

/**
 * A post written here, at its own URL under the Articles section.
 *
 * A static segment, so it takes `/articles/<slug>` from the section catch-all while
 * `/articles` itself still answers with the list.
 *
 * Rendered on demand rather than prerendered — there is no `generateStaticParams`,
 * because publishing a post should not need a build. The body below is a cached
 * scope tagged with the section, so a post is rendered once and then served from
 * the cache until it is edited.
 *
 * The record comes from the section's own read rather than a query of its own: it is
 * already cached under this tag, and a post's fields are the row the Articles list
 * shows. A slug with no body is refused, but the refusal is a streamed 404 page
 * carrying `noindex` rather than a 404 status: the response has already begun by the
 * time the read comes back. The alternative is a lookup in `proxy.ts` on every
 * request to this route, which is a worse trade for a URL nothing links to.
 */
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

  // Before anything renders, so an unwritten slug is refused rather than framed.
  const [article, body] = await Promise.all([
    post(slug),
    getBody("articles", slug),
  ]);
  if (!article || !body) notFound();

  return <CachedArticle slug={slug} />;
}

/** Cached separately so the tag is claimed from inside the entry, as elsewhere. */
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
