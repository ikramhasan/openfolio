import Link from "next/link";
import type { SlateElementProps } from "platejs/static";
import { SlateElement } from "platejs/static";
import {
  type EmbeddableSection,
  embedLimit,
  isEmbeddableSection,
  sectionLabel,
  type TSectionEmbedElement,
} from "@/components/editor/plugins/section-embed-base-plugin";
import { Articles } from "./articles";
import { Awards } from "./awards";
import { getNav } from "./content";
import { Education } from "./education";
import { Experience } from "./experience";
import { Music } from "./music";
import { OpenSource } from "./open-source";
import { Projects } from "./projects";
import { Recommendations } from "./recommendations";
import { Videos } from "./videos";

async function headingOf(section: EmbeddableSection) {
  const { routedSections } = await import("./sections");
  const [nav, routes] = await Promise.all([getNav(), routedSections()]);
  const heading = nav.byKey[section];
  const route = routes.find((entry) => entry.id === section);

  return {
    title: heading?.title || sectionLabel(section),
    note: heading?.note,
    page: route && !route.home ? route.path : undefined,
  };
}

function Listing({
  section,
  limit,
  page,
}: {
  section: EmbeddableSection;
  limit?: number;
  page?: string;
}) {
  switch (section) {
    case "experience":
      return <Experience limit={limit} page={page} />;
    case "projects":
      return <Projects limit={limit} />;
    case "education":
      return <Education limit={limit} />;
    case "openSource":
      return <OpenSource limit={limit} />;
    case "articles":
      return <Articles limit={limit} />;
    case "awards":
      return <Awards limit={limit} />;
    case "youtubeVideos":
      return <Videos limit={limit} />;
    case "music":
      return <Music limit={limit} />;
    case "recommendations":
      return <Recommendations limit={limit} />;
  }
}

export async function SectionEmbed({
  section,
  limit,
}: {
  section: EmbeddableSection;
  limit?: number;
}) {
  const { title, note, page } = await headingOf(section);

  return (
    <section className="pf-section-embed">
      <header>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="pf-section-title">{title}</h2>
          {page ? (
            <Link href={page} className="pf-link-quiet pf-meta">
              View all
            </Link>
          ) : null}
        </div>

        {note ? <p className="pf-meta mt-1">{note}</p> : null}
      </header>

      <div className="mt-6">
        <Listing section={section} limit={limit} page={page} />
      </div>
    </section>
  );
}

export function SectionEmbedBlock(
  props: SlateElementProps<TSectionEmbedElement>,
) {
  const { section, limit } = props.element;

  return (
    <SlateElement {...props} className="pf-prose-block pf-prose-section">
      {isEmbeddableSection(section) ? (
        <SectionEmbed section={section} limit={embedLimit(limit)} />
      ) : null}
      {props.children}
    </SlateElement>
  );
}
