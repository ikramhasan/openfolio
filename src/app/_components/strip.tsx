import Image from "next/image";
import { sections } from "./data";

const images = sections.intro.headingImages;

/**
 * Workshop photography as one thin strip of equal frames.
 *
 * Full colour, and kept short on purpose — in a ledger, photographs are
 * evidence, not the subject. The first frame keeps the source `alt` so the strip
 * is still described to a screen reader.
 *
 * No caption, and no outer spacing: the caller places it.
 */
export function Strip() {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {images.map((image, index) => (
        <div
          key={image.url}
          className="pf-frame relative aspect-3/2 overflow-hidden"
        >
          <Image
            src={image.url}
            alt={index === 0 ? image.alt : ""}
            fill
            sizes="(min-width: 1024px) 320px, 33vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
