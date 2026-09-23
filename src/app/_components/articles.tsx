import { getArticles, getWritten } from "./content";
import { blogUrl, formatCount, shortDate, sortedArticles } from "./data";
import { DateCell, TableHead, TableLinkRow, TableList } from "./table";
import { readPath, slugOf } from "./writing";

/**
 * Posts as rows, newest first. A post written here goes to its own page; the
 * imported ones still go out to where they were published.
 */
export async function Articles() {
  const [{ items }, written] = await Promise.all([
    getArticles(),
    getWritten("articles"),
  ]);

  const native = new Set(written);

  return (
    <div>
      <TableHead left="Date" middle="Article" right="Views" />

      <TableList>
        {sortedArticles(items).map((article) => {
          const slug = slugOf(article);
          const here = native.has(slug);

          return (
            <TableLinkRow
              key={slug || article.url}
              left={<DateCell from={shortDate(article.publishedAt)} />}
              href={here ? readPath("articles", slug) : article.url}
              internal={here}
              right={<span>{formatCount(article.views)}</span>}
            >
              <span className="pf-title block">{article.title}</span>

              {article.excerpt ? (
                <span className="pf-body mt-1 block max-w-[72ch]">
                  {article.excerpt}
                </span>
              ) : null}

              <span className="pf-meta mt-1.5 block">
                {article.readTimeMinutes} min read
              </span>
            </TableLinkRow>
          );
        })}
      </TableList>
    </div>
  );
}

/** "View all" link, set on the section heading row. */
export async function ArticlesAside() {
  const section = await getArticles();
  const href = blogUrl(section);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="pf-link-quiet pf-meta shrink-0"
    >
      {section.viewAll.label} ↗
    </a>
  );
}
