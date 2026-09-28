import { getExperience } from "../../../_components/content";
import { cleanBullet, compactRange } from "../../../_components/data";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderPageCard,
} from "../../../_components/og-image";
import { slugOf } from "../../../_components/writing";

type Params = { slug: string };

async function role(slug: string) {
  const { items } = await getExperience();
  return items.find((item) => slugOf(item) === slug) ?? null;
}

export async function generateImageMetadata({ params }: { params: Params }) {
  const item = await role(params.slug);

  return [
    {
      id: "card",
      alt: item ? `${item.title} at ${item.company}` : "Experience",
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = await role(slug);

  return renderPageCard({
    title: item?.title ?? "Experience",
    standfirst: item?.details.map(cleanBullet).find(Boolean),
    path: "/experience",
    meta: item ? [item.company, compactRange(item.dateRange)] : [],
  });
}
