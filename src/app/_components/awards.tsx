import { getAwards, getWritten } from "./content";
import { byOrder, shortDate } from "./data";
import {
  DateCell,
  TableHead,
  TableLinkRow,
  TableList,
  TableRow,
} from "./table";
import { readPath, slugOf } from "./writing";

export async function Awards() {
  const [{ items }, written] = await Promise.all([
    getAwards(),
    getWritten("awards"),
  ]);

  const native = new Set(written);

  return (
    <div>
      <TableHead left="Date" middle="Award" />

      <TableList>
        {byOrder(items).map((award) => {
          const slug = slugOf(award);
          const here = native.has(slug);
          const href = here ? readPath("awards", slug) : award.url;

          const body = (
            <>
              <span className="pf-title block">{award.title}</span>

              <span className="pf-meta mt-1 block">{award.organization}</span>

              <span className="pf-body mt-2.5 block max-w-[72ch]">
                {award.description.trim()}
              </span>
            </>
          );

          return href ? (
            <TableLinkRow
              key={award.title}
              left={<DateCell from={shortDate(award.date)} />}
              href={href}
              internal={here}
            >
              {body}
            </TableLinkRow>
          ) : (
            <TableRow
              key={award.title}
              left={<DateCell from={shortDate(award.date)} />}
            >
              {body}
            </TableRow>
          );
        })}
      </TableList>
    </div>
  );
}
