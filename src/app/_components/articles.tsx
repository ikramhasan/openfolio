import { getArticles, getWritten } from "./content";
import { formatCount, shortDate, sortedArticles } from "./data";
import { DateCell, TableHead, TableLinkRow, TableList } from "./table";
import { readPath, slugOf } from "./writing";

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
