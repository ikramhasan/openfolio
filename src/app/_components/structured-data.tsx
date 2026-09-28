import { getExperience } from "./content";
import { byOrder } from "./data";
import { routedSections } from "./sections";
import { absolute, identity, isoDate } from "./seo";
import { siteUrl } from "./site-url";

type Graph = Record<string, unknown>;

const PERSON_ID = `${siteUrl}/#person`;
const WEBSITE_ID = `${siteUrl}/#website`;

export function JsonLd({ data }: { data: Graph }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: serialised JSON with every "<" escaped, so it cannot close the script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

function author(name: string): Graph {
  return { "@type": "Person", "@id": PERSON_ID, name, url: siteUrl };
}

type Crumb = { name: string; path: string };

async function trail(sectionId: string, title: string, path: string) {
  const [{ name }, sections] = await Promise.all([
    identity(),
    routedSections(),
  ]);
  const section = sections.find((entry) => entry.id === sectionId);
  const crumbs: Crumb[] = [{ name, path: "/" }];
  if (section && !section.home) {
    crumbs.push({ name: section.title, path: section.path });
  }
  crumbs.push({ name: title, path });

  return { name, crumbs };
}

function breadcrumbs(trail: Crumb[]): Graph {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  };
}

export async function HomeJsonLd() {
  const [{ site, intro, name, sameAs }, experience] = await Promise.all([
    identity(),
    getExperience(),
  ]);
  const current = byOrder(experience.items)[0];

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Person",
            "@id": PERSON_ID,
            name,
            url: siteUrl,
            ...(intro.profileImage ? { image: intro.profileImage } : {}),
            ...(intro.bio ? { description: intro.bio.trim() } : {}),
            ...(sameAs.length ? { sameAs } : {}),
            ...(current
              ? {
                  jobTitle: current.title,
                  worksFor: {
                    "@type": "Organization",
                    name: current.company,
                    ...(current.url ? { url: current.url } : {}),
                  },
                }
              : {}),
          },
          {
            "@type": "WebSite",
            "@id": WEBSITE_ID,
            url: siteUrl,
            name: site.title,
            description: site.description,
            inLanguage: "en",
            publisher: { "@id": PERSON_ID },
          },
          {
            "@type": "ProfilePage",
            "@id": `${siteUrl}/#profile`,
            url: siteUrl,
            name: site.title,
            isPartOf: { "@id": WEBSITE_ID },
            mainEntity: { "@id": PERSON_ID },
          },
        ],
      }}
    />
  );
}

export async function ArticleJsonLd({
  title,
  description,
  path,
  publishedAt,
  image,
  section,
}: {
  title: string;
  description?: string | null;
  path: string;
  publishedAt: string;
  image?: string | null;
  section: string;
}) {
  const { name, crumbs } = await trail(section, title, path);
  const published = isoDate(publishedAt);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",
            "@id": `${absolute(path)}#article`,
            headline: title,
            ...(description ? { description } : {}),
            url: absolute(path),
            mainEntityOfPage: absolute(path),
            ...(published
              ? { datePublished: published, dateModified: published }
              : {}),
            ...(image ? { image: [image] } : {}),
            inLanguage: "en",
            author: author(name),
            publisher: author(name),
            isPartOf: { "@id": WEBSITE_ID },
          },
          breadcrumbs(crumbs),
        ],
      }}
    />
  );
}

export async function WorkJsonLd({
  title,
  description,
  path,
  link,
  keywords,
  section,
}: {
  title: string;
  description?: string | null;
  path: string;
  link?: string | null;
  keywords?: string[];
  section: string;
}) {
  const { name, crumbs } = await trail(section, title, path);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CreativeWork",
            "@id": `${absolute(path)}#work`,
            name: title,
            ...(description ? { description } : {}),
            url: absolute(path),
            ...(link ? { sameAs: link } : {}),
            ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
            creator: author(name),
            isPartOf: { "@id": WEBSITE_ID },
          },
          breadcrumbs(crumbs),
        ],
      }}
    />
  );
}

export async function BreadcrumbJsonLd({
  title,
  path,
  section,
}: {
  title: string;
  path: string;
  section: string;
}) {
  const { crumbs } = await trail(section, title, path);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        ...breadcrumbs(crumbs),
      }}
    />
  );
}
