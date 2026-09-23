import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, tagFor } from "../../../_components/content";
import { formatViews, longDate } from "../../../_components/data";
import { ProseBody } from "../../../_components/prose-body";

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
 * A slug with no body is refused, but the refusal is a streamed 404 page carrying
 * `noindex` rather than a 404 status: the response has already begun by the time the
 * read comes back. The alternative is a lookup in `proxy.ts` on every request to
 * this route, which is a worse trade for a URL nothing links to.
 */
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return {};

  const description = article.excerpt ?? undefined;

  return {
    title: article.title,
    ...(description ? { description } : {}),
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      ...(description ? { description } : {}),
      url: `/articles/${article.slug}`,
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
  if (!(await getArticle(slug))) notFound();

  return <CachedArticle slug={slug} />;
}

/** Cached separately so the tag is claimed from inside the entry, as elsewhere. */
async function CachedArticle({ slug }: { slug: string }) {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("articles"));

  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <article className="pf-rule pf-panel-enter border-t pt-6">
      {/*
        Not the section `Panel`: a section's heading is a label on a list and is set
        at body size, where a post's title is the piece itself.
      */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="pf-page-title">{article.title}</h1>

        <Link href="/articles" className="pf-link-quiet pf-meta shrink-0">
          ← Articles
        </Link>
      </div>

      {article.excerpt ? (
        <p className="pf-page-standfirst">{article.excerpt}</p>
      ) : null}

      <p className="pf-meta mt-4">
        <time dateTime={article.publishedAt}>
          {longDate(article.publishedAt)}
        </time>
        <span aria-hidden="true"> · </span>
        {article.readTimeMinutes} min read
        <span aria-hidden="true"> · </span>
        {formatViews(article.views)} views
      </p>

      {article.coverImage ? (
        <Image
          src={article.coverImage}
          alt=""
          width={1600}
          height={840}
          sizes="(min-width: 1024px) 720px, 100vw"
          className="pf-frame mt-7 w-full rounded-md object-cover"
        />
      ) : null}

      <div className="mt-9">
        <ProseBody value={article.body} />
      </div>
    </article>
  );
}
