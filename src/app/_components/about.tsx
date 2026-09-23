import { CompanyChip } from "./company-chip";
import { getExperience } from "./content";
import { byOrder, yearsSince } from "./data";
import { Strip } from "./strip";

export async function About() {
  const { items } = await getExperience();
  const roles = byOrder(items);
  const [current, previous, contract, earliest] = roles;
  const first = roles[roles.length - 1];

  return (
    <div className="max-w-[36rem]">
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
