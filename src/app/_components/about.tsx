import { CompanyChip } from "./company-chip";
import { currentRole, sortedExperience, yearsSince } from "./data";
import { Strip } from "./strip";

/**
 * The About panel — the section the site opens on, and the only one written as
 * prose rather than as a table.
 *
 * Everything else on the site is a ledger: dated rows, one record each. This is
 * the one place that says what those rows add up to, so it is a short summary
 * with the companies raised as chips. Opening a chip gives the role behind the
 * name without leaving the sentence — see `company-chip.tsx`, which keeps the
 * detail out of flow so nothing moves.
 *
 * The photography leads. The masthead above is only a portrait, a name and a line
 * of bio, so the strip is what gives the panel a top edge; the summary reads
 * better as a caption to it than as a second block of text directly beneath the
 * bio it elaborates on.
 *
 * Every claim here is drawn from `data/portfolio.json` rather than written
 * freehand: the span of experience is computed from the earliest role, the
 * figures (a million events a day, eight million users, 250 students) are the
 * source bullets' own, and the roles are named in source order. Sentences that
 * do not derive from the data would go stale the moment the JSON changed.
 *
 * No links and no "Now" row. The footer already carries the same six social
 * links, the resume and the booking URL on every page — they are the same entries
 * from the same JSON — and the current role is already the first thing the
 * summary says. Repeating either here only made the panel longer.
 */

const roles = sortedExperience;
const [current, transmedia, ictDivision, techshoi] = roles;

export function About() {
  return (
    <div>
      <Strip />

      <div className="pf-body mt-8 max-w-[54ch] space-y-4">
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
