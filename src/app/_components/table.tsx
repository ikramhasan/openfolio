import type { ReactNode } from "react";

/**
 * Shared row primitives: a three-column grid of dates, content and right-aligned
 * metadata.
 *
 * Lists rather than `<table>`s — these are records, not a matrix. Both row kinds
 * carry `.pf-row` so the hover tint spans every record, linkable or not.
 */

const GRID =
  "grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_6.5rem] sm:gap-x-6";

// Endpoints stacked on two lines: on one line the column would take a third of
// the row on a phone. A single date is just one line.
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

/** One record with no destination. */
export function TableRow({
  left,
  right,
  children,
}: {
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
 * A record whose whole row is the link. Content must not contain its own
 * anchors — nested links are invalid.
 */
export function TableLinkRow({
  left,
  href,
  right,
  children,
}: {
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
