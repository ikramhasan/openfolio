import { dateEndpoints, sections } from "./data";
import { Mark } from "./mark";
import {
  DateCell,
  TableHead,
  TableLinkRow,
  TableList,
  TableRow,
} from "./table";

const education = sections.education;

/** Qualifications as rows. Source ranges carry no months, so years only. */
export function Education() {
  return (
    <div>
      <TableHead left="Dates" middle="Qualification" />

      <TableList>
        {education.items.map((item) => {
          const [from, to] = dateEndpoints(item.dateRange);

          const body = (
            <>
              <span className="pf-title block">{item.title}</span>

              <span className="pf-meta mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <Mark src={item.logo} />
                <span className="pf-muted">{item.institution}</span>
                {/* Separator grouped with the location so a wrap cannot leave
                    it dangling. */}
                <span className="whitespace-nowrap">
                  <span aria-hidden="true">· </span>
                  {item.location}
                </span>
              </span>

              {item.description ? (
                <span className="pf-body mt-2.5 block max-w-[72ch]">
                  {item.description}
                </span>
              ) : null}
            </>
          );

          return item.url ? (
            <TableLinkRow
              key={item.institution}
              left={<DateCell from={from} to={to} />}
              href={item.url}
            >
              {body}
            </TableLinkRow>
          ) : (
            <TableRow
              key={item.institution}
              left={<DateCell from={from} to={to} />}
            >
              {body}
            </TableRow>
          );
        })}
      </TableList>
    </div>
  );
}
