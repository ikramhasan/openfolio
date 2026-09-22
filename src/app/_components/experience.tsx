import {
  cleanBullet,
  dateEndpoints,
  rangeQualifier,
  sortedExperience,
} from "./data";
import { Mark } from "./mark";
import {
  DateCell,
  TableHead,
  TableLinkRow,
  TableList,
  TableRow,
} from "./table";

/** Roles as rows, linked where the source carries a company URL. */
export function Experience() {
  return (
    <div>
      <TableHead left="Dates" middle="Role" />

      <TableList>
        {sortedExperience.map((item) => {
          const key = `${item.company}-${item.title}`;
          const [from, to] = dateEndpoints(item.dateRange);
          const qualifier = rangeQualifier(item.dateRange);

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

          return item.url ? (
            <TableLinkRow
              key={key}
              left={<DateCell from={from} to={to} />}
              href={item.url}
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
