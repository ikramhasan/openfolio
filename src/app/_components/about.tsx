import { CompanyChip } from "./company-chip";
import { currentRole, sortedExperience, yearsSince } from "./data";
import { Strip } from "./strip";

/**
 * The About panel: the photo strip, then a short prose summary with the
 * companies as clickable chips.
 *
 * The figures and dates come from `data/portfolio.json` rather than being
 * written out, so the copy does not go stale when the JSON changes.
 */

const roles = sortedExperience;
const [current, transmedia, ictDivision, techshoi] = roles;

export function About() {
  return (
    // One measure for the panel, set here rather than on each child: `ch` resolves
    // against each element's own font-size, so the same `max-w` on the strip and
    // the prose gave two different widths.
    <div className="max-w-[30rem]">
      <Strip />

      <div className="pf-body mt-8 space-y-4">
        <p>
          A <span className="pf-strong">{currentRole.title}</span> of{" "}
          {yearsSince(roles[roles.length - 1].dateRange)} years, currently at{" "}
          <CompanyChip role={current} />, where the work runs from server-side
          analytics that handles about a million events a day to retrieval
          augmented generation and agentic frameworks in production.
        </p>

        <p>
          Before that, <CompanyChip role={transmedia} /> — mobile apps and
          utilities in front of roughly eight million people a month — and a
          contract with <CompanyChip role={ictDivision} />, teaching app
          development to more than 250 students, a good few of whom shipped
          something of their own afterwards. The first few years were at{" "}
          <CompanyChip role={techshoi} />, building cross-platform apps for
          clients from scratch.
        </p>

        <p className="pf-muted">
          Mostly Flutter and Next.js, increasingly Rust. The portfolio beside
          this is the long version: shipped products, technical studies, writing
          and talks.
        </p>
      </div>
    </div>
  );
}
