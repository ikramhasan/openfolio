import { getAwards } from "../../../_components/content";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderPageCard,
} from "../../../_components/og-image";
import { readableDate } from "../../../_components/seo";
import { slugOf } from "../../../_components/writing";

type Params = { slug: string };

async function award(slug: string) {
  const { items } = await getAwards();
  return items.find((item) => slugOf(item) === slug) ?? null;
}

export async function generateImageMetadata({ params }: { params: Params }) {
  const item = await award(params.slug);

  return [
    {
      id: "card",
      alt: item?.title ?? "Award",
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = await award(slug);

  return renderPageCard({
    title: item?.title ?? "Awards",
    standfirst: item?.description,
    path: "/awards",
    meta: item ? [item.organization, readableDate(item.date)] : [],
  });
}
