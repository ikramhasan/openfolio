import { subscribeToNewsletter } from "../_actions/newsletter";
import { getConnect, getFooter } from "./content";
import { sortedLinks } from "./data";
import { Newsletter } from "./newsletter";
import { Signature } from "./signature";

export async function Footer() {
  const footer = await getFooter();
  const { newsletter } = await getConnect();

  const links = sortedLinks(footer.socialLinks);

  return (
    <footer className="pf-rule mt-16 border-t pt-9 pb-14">
      <Signature signature={footer.signature} />

      <Newsletter copy={newsletter} subscribe={subscribeToNewsletter} />

      <ul className="pf-meta mt-9 flex flex-wrap gap-x-5 gap-y-3">
        {links.map((link) => (
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
      </ul>

      <div className="pf-rule mt-8 border-t pt-4">
        <p className="pf-meta">{footer.copyright}</p>
      </div>
    </footer>
  );
}
