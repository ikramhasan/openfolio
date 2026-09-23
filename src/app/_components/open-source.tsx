import { getOpenSource } from "./content";
import { formatCount, repoParts, shortDate, sortedContributions } from "./data";
import { Mark } from "./mark";
import { DateCell, TableHead, TableLinkRow, TableList } from "./table";

/**
 * Contributions to other people's repositories, newest first. The whole row is the
 * pull request, so every one of these links out.
 *
 * The state and the star count are the snapshot the record holds, not a read of
 * GitHub: see `convex/github.ts`. A count of nothing is left off rather than shown
 * as zero.
 */
export async function OpenSource() {
  const { items } = await getOpenSource();

  return (
    <div>
      <TableHead left="Date" middle="Contribution" right="Ref" />

      <TableList>
        {/* A row added but never fetched has nothing to show; it is not a record yet. */}
        {sortedContributions(items)
          .filter((item) => item.title !== "")
          .map((item) => {
            const repo = repoParts(item.repo);

            const facts = [
              item.state,
              item.stars > 0 ? `${formatCount(item.stars)} stars` : "",
            ].filter(Boolean);

            return (
              <TableLinkRow
                key={item.url || item.title}
                left={<DateCell from={shortDate(item.date)} />}
                href={item.url}
                right={
                  item.number > 0 ? <span>#{item.number}</span> : undefined
                }
              >
                <span className="flex items-baseline gap-2.5">
                  <span className="translate-y-0.5">
                    <Mark src={item.avatar} />
                  </span>
                  <span className="pf-title">{item.title}</span>
                </span>

                <span className="pf-meta mt-1.5 flex flex-wrap items-baseline gap-x-2">
                  {repo.name ? (
                    <span className="min-w-0 truncate">
                      {repo.owner ? (
                        <>
                          {repo.owner}
                          <span className="pf-faint"> / </span>
                        </>
                      ) : null}
                      {repo.name}
                    </span>
                  ) : null}

                  {facts.map((fact, index) => (
                    <span key={fact} className="whitespace-nowrap">
                      {repo.name || index > 0 ? (
                        <span aria-hidden="true">· </span>
                      ) : null}
                      {fact}
                    </span>
                  ))}
                </span>
              </TableLinkRow>
            );
          })}
      </TableList>
    </div>
  );
}
