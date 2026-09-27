import { subscribeToNewsletter } from "../_actions/newsletter";
import { getConnect, getFooter, getIntro } from "./content";
import { sortedLinks } from "./data";
import { Newsletter } from "./newsletter";

export async function Footer() {
  const footer = await getFooter();
  const connect = await getConnect();
  const { title } = await getIntro();

  const links = sortedLinks(footer.socialLinks);
  const copyright = `© ${new Date().getFullYear()} ${title}`;

  return (
    <footer className="pf-rule mt-16 border-t pt-10 pb-12">
      <div className="grid gap-x-16 gap-y-10 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          {connect.title ? (
            <h2 className="pf-section-title">{connect.title}</h2>
          ) : null}
          <Newsletter
            copy={connect.newsletter}
            subscribe={subscribeToNewsletter}
          />
        </div>

        {links.length ? (
          <nav aria-label="Elsewhere">
            <ul className="pf-meta grid grid-cols-2 gap-x-10 gap-y-2.5 sm:pt-0.5">
              {links.map((link) => (
                <li key={link.site}>
                  <a
                    href={link.url}
                    className="pf-link-quiet whitespace-nowrap"
                    {...(link.site === "email"
                      ? {}
                      : { target: "_blank", rel: "noreferrer" })}
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>

      <div className="pf-meta pf-faint mt-12 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p>{copyright}</p>
        <a href="#top" className="pf-link-quiet">
          Back to top
        </a>
      </div>
    </footer>
  );
}
