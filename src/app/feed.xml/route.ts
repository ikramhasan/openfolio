import { getArticles, getBody, getWritten } from "../_components/content";
import { sortedArticles } from "../_components/data";
import { absolute, bodyExcerpt, FEED_PATH, identity } from "../_components/seo";
import { readPath, slugOf } from "../_components/writing";

function xmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(value: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toUTCString();
}

export async function GET(): Promise<Response> {
  const [{ site, name }, { items }, written] = await Promise.all([
    identity(),
    getArticles(),
    getWritten("articles"),
  ]);
  const native = new Set(written);
  const articles = sortedArticles(items);

  const entries = await Promise.all(
    articles.map(async (article) => {
      const slug = slugOf(article);
      const here = native.has(slug);
      const link = here ? absolute(readPath("articles", slug)) : article.url;
      const summary =
        article.excerpt?.trim() ||
        (here ? bodyExcerpt(await getBody("articles", slug)) : null);
      const date = rfc822(article.publishedAt);

      return [
        "    <item>",
        `      <title>${xmlText(article.title)}</title>`,
        `      <link>${xmlText(link)}</link>`,
        `      <guid isPermaLink="true">${xmlText(link)}</guid>`,
        date ? `      <pubDate>${date}</pubDate>` : null,
        summary ? `      <description>${xmlText(summary)}</description>` : null,
        `      <dc:creator>${xmlText(name)}</dc:creator>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    }),
  );

  const latest = articles[0] ? rfc822(articles[0].publishedAt) : null;

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${xmlText(site.title)}</title>`,
    `    <link>${xmlText(absolute("/"))}</link>`,
    `    <description>${xmlText(site.description)}</description>`,
    "    <language>en</language>",
    latest ? `    <lastBuildDate>${latest}</lastBuildDate>` : null,
    `    <atom:link href="${xmlText(absolute(FEED_PATH))}" rel="self" type="application/rss+xml" />`,
    ...entries,
    "  </channel>",
    "</rss>",
  ]
    .filter(Boolean)
    .join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
