import { getProjects } from "../../../_components/content";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderPageCard,
} from "../../../_components/og-image";
import { slugOf } from "../../../_components/writing";

type Params = { slug: string };

async function project(slug: string) {
  const { items } = await getProjects();
  return items.find((item) => slugOf(item) === slug) ?? null;
}

export async function generateImageMetadata({ params }: { params: Params }) {
  const item = await project(params.slug);

  return [
    {
      id: "card",
      alt: item?.title ?? "Project",
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = await project(slug);

  return renderPageCard({
    title: item?.title ?? "Projects",
    standfirst: item?.description,
    path: "/projects",
    meta: item?.tags.slice(0, 3).map((tag) => tag.toLowerCase()) ?? [],
  });
}
