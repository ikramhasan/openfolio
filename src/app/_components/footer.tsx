import { bookingUrl, footerLinks, portfolio, resumeUrl } from "./data";

const footer = portfolio.footer;

export function Footer() {
  return (
    <footer className="pf-rule mt-16 border-t pt-7 pb-14">
      {/* The source data references a vector signature asset; it is typeset
          here instead of shipping an image. */}
      <p className="pf-signature">{footer.signature.owner}</p>

      <ul className="pf-meta mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
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
