import { getArticles, getWrittenArticles } from "./content";
import { blogUrl, formatViews, shortDate, sortedArticles } from "./data";
import { DateCell, TableHead, TableLinkRow, TableList } from "./table";

/**
 * Posts as rows, newest first. A post written here goes to its own page; the
 * imported ones still go out to where they were published.
 */
export async function Articles() {
  const [{ items }, written] = await Promise.all([
    getArticles(),
    getWrittenArticles(),
  ]);

  const native = new Set(written);

  return (
    <div>
      <TableHead left="Date" middle="Article" right="Views" />

      <TableList>
        {sortedArticles(items).map((article) => {
          const here = native.has(article.slug);

          return (
            <TableLinkRow
              key={article.slug || article.url}
              left={<DateCell from={shortDate(article.publishedAt)} />}
              href={here ? `/articles/${article.slug}` : article.url}
              internal={here}
              right={<span>{formatViews(article.views)}</span>}
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
