import Image from "next/image";
import { sections } from "./data";

const images = sections.intro.headingImages;

const [lead, ...rest] = images;

/**
 * Workshop photography: one lead frame, the remainder in a row beneath it.
 *
 * Three equal frames in a single row made each one a thin letterbox — too short
 * to read as a photograph, and together they ran the full width of the panel
 * while the prose beside them stops at 54ch, so the block overhung the column it
 * belonged to. The lead frame now carries the width and the height, and the rest
 * sit under it at half scale.
 *
 * Full colour, and kept to a block — in a ledger, photographs are evidence, not
 * the subject. The first frame keeps the source `alt` so the strip is still
 * described to a screen reader.
 *
 * No width of its own and no outer spacing: the caller sets the measure this
 * shares with the prose, and places it.
 */
export function Strip() {
  return (
    <div>
      <div className="pf-frame relative aspect-16/9 overflow-hidden">
        <Image
          src={lead.url}
          alt={lead.alt}
          fill
          sizes="(min-width: 1024px) 480px, 100vw"
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
                sizes="(min-width: 1024px) 237px, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
