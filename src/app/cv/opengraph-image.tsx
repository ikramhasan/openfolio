import { getIntro } from "../_components/content";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderPageCard,
} from "../_components/og-image";

export async function generateImageMetadata() {
  const intro = await getIntro();

  return [
    {
      id: "card",
      alt: `The curriculum vitae of ${intro.title}`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image() {
  const intro = await getIntro();

  return renderPageCard({
    title: "Curriculum vitae",
    standfirst: intro.bio,
    path: "/cv",
  });
}
