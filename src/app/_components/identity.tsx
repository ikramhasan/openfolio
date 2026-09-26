import { textToSvg } from "tegaki/core";
import bundle from "tegaki/fonts/nanum-pen-script";
import { getIntro } from "./content";

const FONT_SIZE = 34;
const LETTER_SPACING = -2;

export async function Identity() {
  const { title } = await getIntro();

  if (!title) return null;

  const svg = textToSvg(title, bundle, {
    fontSize: FONT_SIZE,
    letterSpacing: LETTER_SPACING,
    mode: "loop",
    color: "currentColor",
  });

  return (
    <div className="hidden min-w-0 pb-7 lg:block">
      <span
        role="img"
        aria-label={title}
        className="pf-handwriting block"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: tegaki emits stroke geometry only, never the source text
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
