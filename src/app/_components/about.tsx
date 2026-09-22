import { CompanyChip } from "./company-chip";
import { getExperience } from "./content";
import { byOrder, yearsSince } from "./data";
import { Strip } from "./strip";

/**
 * The About panel: the photo strip, then a short prose summary with the companies
 * as clickable chips.
 *
 * The figures and dates are computed from the Experience records rather than
 * written out, so the copy cannot go stale. The sentences do name specific roles,
 * though: adding or removing one of the first four means editing this file. Each
 * clause is guarded so a shorter list renders a shorter summary instead of failing.
 */
export async function About() {
  const { items } = await getExperience();
  const roles = byOrder(items);
  const [current, previous, contract, earliest] = roles;
  const first = roles[roles.length - 1];

  return (
    // One measure for the panel, set here rather than on each child: `ch` resolves
    // against each element's own font-size, so the same `max-w` on the strip and
    // the prose gave two different widths.
    <div className="max-w-[30rem]">
      <Strip />

      <div className="pf-body mt-8 space-y-4">
        {current ? (
          <p>
            A <span className="pf-strong">{current.title}</span> of{" "}
            {yearsSince(first.dateRange)} years, currently at{" "}
            <CompanyChip role={current} />, where the work runs from server-side
            analytics that handles about a million events a day to retrieval
            augmented generation and agentic frameworks in production.
          </p>
        ) : null}

        {previous ? (
          <p>
            Before that, <CompanyChip role={previous} /> — mobile apps and
            utilities in front of roughly eight million people a month
            {contract ? (
              <>
                {" "}
                — and a contract with <CompanyChip role={contract} />, teaching
                app development to more than 250 students, a good few of whom
                shipped something of their own afterwards
              </>
            ) : null}
            .
            {earliest ? (
              <>
                {" "}
                The first few years were at <CompanyChip role={earliest} />,
                building cross-platform apps for clients from scratch.
              </>
            ) : null}
          </p>
        ) : null}

        <p className="pf-muted">
          Mostly Flutter and Next.js, increasingly Rust. The portfolio beside
          this is the long version: shipped products, technical studies, writing
          and talks.
        </p>
      </div>
    </div>
  );
}
