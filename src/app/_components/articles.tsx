import {
  blogUrl,
  formatViews,
  sections,
  shortDate,
  sortedArticles,
} from "./data";
import { DateCell, TableHead, TableLinkRow, TableList } from "./table";

/**
 * Posts as rows.
 *
 * One date, in the left column only. The metadata line under each title used to
 * restate the month and year the column already carried, so it is down to the
 * read time.
 */
export function Articles() {
  return (
    <div>
      <TableHead left="Date" middle="Article" right="Views" />

      <TableList>
        {sortedArticles.map((article) => (
          <TableLinkRow
            key={article.url}
            left={<DateCell from={shortDate(article.publishedAt)} />}
            href={article.url}
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
        ))}
      </TableList>
    </div>
  );
}

/** "View all" link, set on the section heading row. */
export function ArticlesAside() {
  if (!blogUrl) return null;

  return (
    <a
      href={blogUrl}
      target="_blank"
      rel="noreferrer"
      className="pf-link-quiet pf-meta shrink-0"
    >
      {sections.articles.viewAll.label} ↗
    </a>
  );
}
