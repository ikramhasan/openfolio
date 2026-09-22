import { bookingUrl, currentRole, resumeUrl, socialLinks } from "./data";
import { Skills } from "./skills";
import { Strip } from "./strip";

/**
 * The About panel — the tab the page opens on.
 *
 * It gathers everything that is *about* the person rather than a record of their
 * work: the current role, the links, the workshop photography, and the skills
 * list. Keeping them here rather than in the masthead lets the persistent header
 * above the tabs stay down to a portrait, a name and a line of bio.
 *
 * Skills lives here rather than as its own tab because it is three rows — a tab
 * of its own would be the shortest panel on the page by a wide margin, and it
 * answers the same question the rest of this panel does. The component is reused
 * as-is, so the table matches every other one on the site.
 */
export function About() {
  return (
    <div>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
        <dt className="pf-column pt-1">Now</dt>
        <dd className="pf-body pf-strong">
          {currentRole.title}, {currentRole.company}
          <span className="pf-faint"> · {currentRole.location.trim()}</span>
        </dd>

        <dt className="pf-column pt-1">Links</dt>
        <dd>
          <ul className="pf-meta flex flex-wrap gap-x-4 gap-y-1.5">
            {socialLinks.map((link) => (
              <li key={link.site}>
                <a
                  href={link.url}
                  className="pf-link-quiet"
                  {...(link.site === "email"
                    ? {}
                    : { target: "_blank", rel: "noreferrer" })}
                >
                  {link.title}
                </a>
              </li>
            ))}
            {resumeUrl ? (
              <li>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pf-link-quiet"
                >
                  Resume
                </a>
              </li>
            ) : null}
            {bookingUrl ? (
              <li>
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pf-link-quiet"
                >
                  Book a meeting
                </a>
              </li>
            ) : null}
          </ul>
        </dd>
      </dl>

      <div className="mt-8">
        <Strip />
      </div>

      {/* The panel heading above says "About", so the skills table needs a label
          of its own or it arrives as an unexplained list of numbers. */}
      <div className="pf-rule mt-8 border-t pt-7">
        <h3 className="pf-column">Skills</h3>

        <div className="mt-4">
          <Skills />
        </div>
      </div>
    </div>
  );
}
