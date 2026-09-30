import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getArticles, getWritten } from "./content";
import { formatCount, sortedArticles } from "./data";
import type { ArticlesSection } from "./types";
import { readPath, slugOf } from "./writing";

type Article = ArticlesSection["items"][number];

function formatDate(iso: string, options: Intl.DateTimeFormatOptions) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}

function yearOf(iso: string): string {
  return formatDate(iso, { year: "numeric" }) || "Undated";
}

function ArticleLink({
  href,
  internal,
  className,
  children,
}: {
  href: string;
  internal: boolean;
  className: string;
  children: ReactNode;
}) {
  if (internal) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}

function Featured({
  article,
  href,
  internal,
}: {
  article: Article;
  href: string;
  internal: boolean;
}) {
  return (
    <ArticleLink
      href={href}
      internal={internal}
      className="pf-row -mx-3 grid items-center gap-x-8 gap-y-5 p-3 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
    >
      {article.coverImage ? (
        <span className="pf-cover relative block aspect-[1.91/1] overflow-hidden rounded-[10px]">
          <Image
            src={article.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
          />
        </span>
      ) : null}

      <span className="block min-w-0">
        <span className="pf-feature-title block">{article.title}</span>

        {article.excerpt ? (
          <span className="pf-body mt-2 block">{article.excerpt}</span>
        ) : null}

        <span className="pf-meta pf-figure mt-3 flex flex-wrap gap-x-2.5">
          <span className="pf-strong">Pinned</span>
          <span className="pf-faint">
            {formatDate(article.publishedAt, {
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="pf-faint">{article.readTimeMinutes} min read</span>
          <span className="pf-faint">{formatCount(article.views)} views</span>
        </span>
      </span>
    </ArticleLink>
  );
}

function Row({
  article,
  href,
  internal,
}: {
  article: Article;
  href: string;
  internal: boolean;
}) {
  return (
    <li>
      <ArticleLink
        href={href}
        internal={internal}
        className="pf-row -mx-3 flex items-baseline justify-between gap-x-6 px-3 py-4"
      >
        <span className="block min-w-0">
          <span className="pf-role-title block">{article.title}</span>

          {article.excerpt ? (
            <span className="pf-body mt-1 block max-w-[64ch]">
              {article.excerpt}
            </span>
          ) : null}

          <span className="pf-meta pf-figure pf-faint mt-1 flex flex-wrap gap-x-2.5">
            <span>
              {formatDate(article.publishedAt, {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>{article.readTimeMinutes} min read</span>
            <span className="sm:hidden">
              {formatCount(article.views)} views
            </span>
          </span>
        </span>

        <span className="pf-meta pf-figure pf-faint hidden shrink-0 whitespace-nowrap sm:block">
          {formatCount(article.views)} views
        </span>
      </ArticleLink>
    </li>
  );
}

export async function Articles({ limit }: { limit?: number } = {}) {
  const [{ items }, written] = await Promise.all([
    getArticles(),
    getWritten("articles"),
  ]);

  const native = new Set(written);
  const sorted = sortedArticles(items);
  const listed = [
    ...sorted.filter((article) => article.pinned),
    ...sorted.filter((article) => !article.pinned),
  ].slice(0, limit);
  const pinned = listed.filter((article) => article.pinned);
  const rest = listed.filter((article) => !article.pinned);

  const years = new Map<string, Article[]>();
  for (const article of rest) {
    const year = yearOf(article.publishedAt);
    years.set(year, [...(years.get(year) ?? []), article]);
  }

  const target = (article: Article) => {
    const slug = slugOf(article);
    const here = native.has(slug);
    return {
      href: here ? readPath("articles", slug) : article.url,
      internal: here,
    };
  };

  return (
    <div>
      {pinned.length ? (
        <div className="mb-8 space-y-4">
          {pinned.map((article) => (
            <Featured
              key={slugOf(article) || article.url}
              article={article}
              {...target(article)}
            />
          ))}
        </div>
      ) : null}

      <div className="pf-rule divide-y border-t">
        {[...years].map(([year, articles]) => (
          <section
            key={year}
            className="grid pt-4 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-x-6 sm:pt-0"
          >
            <h2 className="pf-meta pf-figure pf-strong font-medium sm:pt-[1.1rem]">
              {year}
            </h2>

            <ol className="pf-rule divide-y">
              {articles.map((article) => (
                <Row
                  key={slugOf(article) || article.url}
                  article={article}
                  {...target(article)}
                />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
