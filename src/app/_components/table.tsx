import type { ReactNode } from "react";

/**
 * The table primitives that give the page its structure.
 *
 * Every section is the same three-column grid — a fixed left column for the
 * year or ordinal, a flexible middle for content, and a narrow right column for
 * metadata that has to align vertically (views, levels, a link arrow). Column
 * headers name those columns once at the top of the section.
 *
 * Semantically these are lists, not `<table>`s: the data is a sequence of
 * records rather than a matrix, and a real table would promise row/column
 * relationships to a screen reader that do not exist here.
 *
 * Both row kinds carry `.pf-row`, so the hover tint spans the full width of
 * every record in every section — not just the linkable ones. Where a record
 * has a destination, `TableLinkRow` makes the entire row the anchor, so the
 * whole thing is clickable rather than only its title.
 */

const GRID =
  "grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_6.5rem] sm:gap-x-6";

/**
 * The dates for one record, in the left column.
 *
 * Two lines rather than one: "Feb 22 – Sep 22" on a single line would force the
 * column to roughly a third of the row on a phone, and wrapping it naturally puts
 * the break wherever it lands. Stacking the endpoints keeps the column narrow and
 * the years aligned down the page — and a single-date record is simply one line.
 *
 * The dash trails the first line so the pair reads as a range while stacked.
 */
export function DateCell({ from, to }: { from: string; to?: string | null }) {
  return (
    <span className="pf-meta pf-figure block pt-px">
      <span className="block whitespace-nowrap">
        {from}
        {to ? <span aria-hidden="true"> –</span> : null}
      </span>
      {to ? (
        <span className="pf-faint block whitespace-nowrap">{to}</span>
      ) : null}
    </span>
  );
}

/** The column-header row. Hidden below `sm`, where the grid collapses. */
export function TableHead({
  left,
  middle,
  right,
}: {
  left: string;
  middle: string;
  right?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pf-rule ${GRID} hidden border-b pb-2 sm:grid`}
    >
      <span className="pf-column">{left}</span>
      <span className="pf-column">{middle}</span>
      {right ? <span className="pf-column sm:text-right">{right}</span> : null}
    </div>
  );
}

export function TableList({ children }: { children: ReactNode }) {
  return <ol className="pf-rule divide-y">{children}</ol>;
}

/**
 * One record with no destination. Same grid and same hover tint as a link row,
 * so sections without URLs still read as rows rather than loose text.
 *
 * Below `sm` the right column drops under the content rather than squeezing
 * into a third of the width.
 */
export function TableRow({
  left,
  right,
  children,
}: {
  /** Usually a `DateCell`; carries its own type styling. */
  left: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <li>
      <div className={`pf-row ${GRID} -mx-3 px-3 py-4`}>
        <div className="min-w-0">{left}</div>

        <div className="min-w-0">{children}</div>

        {right ? (
          <div className="pf-meta pf-figure col-start-2 mt-1.5 sm:col-start-3 sm:mt-0 sm:text-right">
            {right}
          </div>
        ) : null}
      </div>
    </li>
  );
}

/**
 * A record whose whole row is a link — the full grid is the target, with a
 * trailing arrow that fades in on hover.
 *
 * Content passed here must not contain its own anchors: nested links are
 * invalid, and the point of this row is that there is exactly one target.
 */
export function TableLinkRow({
  left,
  href,
  right,
  children,
}: {
  /** Usually a `DateCell`; carries its own type styling. */
  left: ReactNode;
  href: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const external = !href.startsWith("mailto:") && !href.startsWith("#");

  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className={`pf-row ${GRID} -mx-3 px-3 py-4`}
      >
        <span className="block min-w-0">{left}</span>

        <span className="block min-w-0">{children}</span>

        <span className="pf-meta pf-figure col-start-2 mt-1.5 flex items-baseline gap-2 sm:col-start-3 sm:mt-0 sm:justify-end">
          {right}
          <span aria-hidden="true" className="pf-row-arrow">
            ↗
          </span>
        </span>
      </a>
    </li>
  );
}
