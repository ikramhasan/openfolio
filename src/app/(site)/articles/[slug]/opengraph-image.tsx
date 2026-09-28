import { getArticles, getBody } from "../../../_components/content";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderPageCard,
} from "../../../_components/og-image";
import { bodyExcerpt, readableDate } from "../../../_components/seo";
import { slugOf } from "../../../_components/writing";

type Params = { slug: string };

async function post(slug: string) {
  const { items } = await getArticles();
  return items.find((item) => slugOf(item) === slug) ?? null;
}

export async function generateImageMetadata({ params }: { params: Params }) {
  const article = await post(params.slug);

  return [
    {
      id: "card",
      alt: article?.title ?? "Article",
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = await post(slug);

  return renderPageCard({
    title: article?.title ?? "Articles",
    standfirst:
      article?.excerpt?.trim() || bodyExcerpt(await getBody("articles", slug)),
    path: "/articles",
    meta: article
      ? [
          readableDate(article.publishedAt),
          `${article.readTimeMinutes} min read`,
        ]
      : [],
  });
}
