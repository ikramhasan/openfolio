import Link from "next/link";
import type { SlateElementProps } from "platejs/static";
import { SlateElement } from "platejs/static";
import {
  type EmbeddableSection,
  embedLimit,
  isEmbeddableSection,
  type TSectionEmbedElement,
} from "@/components/editor/plugins/section-embed-base-plugin";
import { Articles } from "./articles";
import { Awards } from "./awards";
import { Education } from "./education";
import { Experience } from "./experience";
import { Music } from "./music";
import { OpenSource } from "./open-source";
import { Projects } from "./projects";
import { Recommendations } from "./recommendations";
import { Videos } from "./videos";

async function pageOf(section: EmbeddableSection): Promise<string | undefined> {
  const { routedSections } = await import("./sections");
  const route = (await routedSections()).find((entry) => entry.id === section);
  return route && !route.home ? route.path : undefined;
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
  const page = await pageOf(section);

  return (
    <div className="pf-section-embed">
      <Listing section={section} limit={limit} page={page} />

      {page ? (
        <p className="mt-4">
          <Link href={page} className="pf-link-quiet pf-meta inline-flex">
            View all
          </Link>
        </p>
      ) : null}
    </div>
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
