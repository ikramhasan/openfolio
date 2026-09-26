import { subscribeToNewsletter } from "../_actions/newsletter";
import { getConnect, getFooter, getIntro } from "./content";
import { sortedLinks } from "./data";
import { Newsletter } from "./newsletter";

export async function Footer() {
  const footer = await getFooter();
  const { newsletter } = await getConnect();
  const { title } = await getIntro();

  const links = sortedLinks(footer.socialLinks);
  const copyright = `© ${new Date().getFullYear()} ${title}. All rights reserved.`;

  return (
    <footer className="pf-rule mt-16 border-t pt-9 pb-14">
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
        <p className="pf-meta">{copyright}</p>
      </div>
    </footer>
  );
}
