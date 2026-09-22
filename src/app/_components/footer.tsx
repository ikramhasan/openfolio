import { bookingUrl, footerLinks, portfolio, resumeUrl } from "./data";
import { Newsletter } from "./newsletter";
import { Signature } from "./signature";

const footer = portfolio.footer;

/** The footer: signature, newsletter sign-up, links, copyright. */
export function Footer() {
  return (
    <footer className="pf-rule mt-16 border-t pt-9 pb-14">
      <Signature />

      <Newsletter />

      {/* `mt-9` matches the `pt-9` above, so the form sits evenly between the
          top rule and the links. */}
      <ul className="pf-meta mt-9 flex flex-wrap gap-x-5 gap-y-3">
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
