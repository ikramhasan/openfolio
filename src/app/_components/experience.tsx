import { getExperience, getWritten } from "./content";
import { byOrder, cleanBullet, dateEndpoints, rangeQualifier } from "./data";
import { Mark } from "./mark";
import {
  DateCell,
  TableHead,
  TableLinkRow,
  TableList,
  TableRow,
} from "./table";
import { readPath, slugOf } from "./writing";

/**
 * Roles as rows. A role written here goes to its own page, before the company URL
 * the record carries.
 */
export async function Experience() {
  const [{ items }, written] = await Promise.all([
    getExperience(),
    getWritten("experience"),
  ]);

  const native = new Set(written);

  return (
    <div>
      <TableHead left="Dates" middle="Role" />

      <TableList>
        {byOrder(items).map((item) => {
          const key = `${item.company}-${item.title}`;
          const [from, to] = dateEndpoints(item.dateRange);
          const qualifier = rangeQualifier(item.dateRange);
          const slug = slugOf(item);
          const here = native.has(slug);
          const href = here ? readPath("experience", slug) : item.url;

          const body = (
            <>
              <span className="pf-title block">{item.title}</span>

              <span className="pf-meta mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <Mark src={item.logo} />
                <span className="pf-muted">{item.company}</span>
                {/* Separator grouped with the location so a wrap cannot leave
                    it dangling. */}
                <span className="whitespace-nowrap">
                  <span aria-hidden="true">· </span>
                  {item.location.trim()}
                </span>
                {qualifier ? (
                  <span className="whitespace-nowrap">
                    <span aria-hidden="true">· </span>
                    {qualifier}
                  </span>
                ) : null}
              </span>

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

          return href ? (
            <TableLinkRow
              key={key}
              left={<DateCell from={from} to={to} />}
              href={href}
              internal={here}
            >
              {body}
            </TableLinkRow>
          ) : (
            <TableRow key={key} left={<DateCell from={from} to={to} />}>
              {body}
            </TableRow>
          );
        })}
      </TableList>
    </div>
  );
}
