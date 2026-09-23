import Image from "next/image";
import { getIntro } from "./content";

/**
 * Workshop photography: one lead frame, the others in a row beneath it.
 *
 * No width of its own — the caller sets the measure it shares with the prose.
 */
export async function Strip() {
  const { headingImages } = await getIntro();
  const [lead, ...rest] = headingImages.filter((image) => image.url !== "");

  // The list is editable, and one frame is the minimum this makes sense at.
  if (!lead) return null;

  return (
    <div>
      <div className="pf-frame relative aspect-16/9 overflow-hidden">
        <Image
          src={lead.url}
          alt={lead.alt}
          fill
          sizes="(min-width: 1024px) 576px, 100vw"
          priority
          className="object-cover"
        />
      </div>

      {rest.length > 0 ? (
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          {rest.map((image) => (
            <div
              key={image.url}
              className="pf-frame relative aspect-3/2 overflow-hidden"
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 285px, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
