import { getSite } from "./_components/content";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderHomeCard,
} from "./_components/og-image";

export async function generateImageMetadata() {
  const site = await getSite();

  return [
    {
      id: "card",
      alt: site.title,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default function Image() {
  return renderHomeCard();
}
