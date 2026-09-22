import { getAwards } from "./content";
import { byOrder, shortDate } from "./data";
import {
  DateCell,
  TableHead,
  TableLinkRow,
  TableList,
  TableRow,
} from "./table";

/** Awards as rows. One date each, so the left column is a single line. */
export async function Awards() {
  const { items } = await getAwards();

  return (
    <div>
      <TableHead left="Date" middle="Award" />

      <TableList>
        {byOrder(items).map((award) => {
          const body = (
            <>
              <span className="pf-title block">{award.title}</span>

              <span className="pf-meta mt-1 block">{award.organization}</span>

              <span className="pf-body mt-2.5 block max-w-[72ch]">
                {award.description.trim()}
              </span>
            </>
          );

          return award.url ? (
            <TableLinkRow
              key={award.title}
              left={<DateCell from={shortDate(award.date)} />}
              href={award.url}
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
