import { cleanBullet, sortedExperience, startYear } from "./data";
import { Mark } from "./mark";
import { TableHead, TableLinkRow, TableList, TableRow } from "./table";

/**
 * Roles as rows. Where the source carries a company URL the whole row is the
 * link — previously only the company name was, which left most of the record
 * inert. Rows without a URL keep the same hover tint so the section reads
 * evenly.
 */
export function Experience() {
  return (
    <div>
      <TableHead left="From" middle="Role" />

      <TableList>
        {sortedExperience.map((item) => {
          const key = `${item.company}-${item.title}`;
          const body = (
            <>
              <span className="pf-title block">{item.title}</span>

              <span className="pf-meta mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <Mark src={item.logo} />
                <span className="pf-muted">{item.company}</span>
                {/* Separator grouped with the location so a wrap cannot leave
                    it dangling at the end of the previous line. */}
                <span className="whitespace-nowrap">
                  <span aria-hidden="true">· </span>
                  {item.location.trim()}
                </span>
              </span>

              {/* The full range carries months and any contract qualifier, which
                  the year column cannot. */}
              <span className="pf-meta block">{item.dateRange}</span>

              <span className="mt-3 block max-w-[72ch] space-y-1.5">
                {item.details.map((detail) => {
                  const text = cleanBullet(detail);
                  return (
                    <span key={text} className="pf-body flex gap-2.5">
                      <span aria-hidden="true" className="pf-faint select-none">
                        ·
                      </span>
                      <span>{text}</span>
                    </span>
                  );
                })}
              </span>
            </>
          );

          return item.url ? (
            <TableLinkRow
              key={key}
              left={startYear(item.dateRange)}
              href={item.url}
            >
              {body}
            </TableLinkRow>
          ) : (
            <TableRow key={key} left={startYear(item.dateRange)}>
              {body}
            </TableRow>
          );
        })}
      </TableList>
    </div>
  );
}
