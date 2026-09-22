import { formatMonthYear, sortedAwards, startYear } from "./data";
import { TableHead, TableLinkRow, TableList, TableRow } from "./table";

/**
 * Awards as rows. Linked where the source carries a URL, and hover-tinted
 * either way.
 */
export function Awards() {
  return (
    <div>
      <TableHead left="Year" middle="Award" />

      <TableList>
        {sortedAwards.map((award) => {
          const body = (
            <>
              <span className="pf-title block">{award.title}</span>

              <span className="pf-meta mt-1 block">
                {award.organization} · {formatMonthYear(award.date)}
              </span>

              <span className="pf-body mt-2.5 block max-w-[72ch]">
                {award.description.trim()}
              </span>
            </>
          );

          return award.url ? (
            <TableLinkRow
              key={award.title}
              left={startYear(award.date)}
              href={award.url}
            >
              {body}
            </TableLinkRow>
          ) : (
            <TableRow key={award.title} left={startYear(award.date)}>
              {body}
            </TableRow>
          );
        })}
      </TableList>
    </div>
  );
}
