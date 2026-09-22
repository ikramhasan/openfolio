import { bookingUrl, footerLinks, portfolio, resumeUrl } from "./data";
import { Newsletter } from "./newsletter";

const footer = portfolio.footer;

/**
 * The footer, and the only place on the site that asks the reader for anything.
 *
 * Contact used to be a section of its own in the rail. It is one form and two
 * links — the shortest panel on the site, and the thing a reader looks for at the
 * bottom of a page rather than in a section index — so it lives here instead, on
 * every page, and the rail is nine entries of actual content.
 *
 * No name above it. The masthead already carries it at full display size a few
 * hundred pixels up, and a signature repeating it was the largest type in the
 * footer for the least information.
 */
export function Footer() {
  return (
    <footer className="pf-rule mt-16 border-t pt-9 pb-14">
      <Newsletter />

      {/* `mt-9` matches the `pt-9` above the form, so the block sits evenly
          between the footer's top rule and its links. */}
      <ul className="pf-meta mt-9 flex flex-wrap gap-x-4 gap-y-1.5">
        {footerLinks.map((link) => (
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

      <div className="pf-rule mt-8 border-t pt-4">
        <p className="pf-meta">{footer.copyright}</p>
      </div>
    </footer>
  );
}
