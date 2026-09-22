import Image from "next/image";
import { sortedVideos } from "./data";

/**
 * Videos. The source holds a single item, so this renders as one still at card
 * width rather than a grid — a one-cell grid reads as a mistake.
 *
 * The whole record is the link and carries the same hover tint as a table row,
 * but unlike a table row it is not full-bleed: the anchor is capped at the
 * card's own width so the tint hugs the still, instead of running off across the
 * empty space to its right. The `1.5rem` added to the cap is the `-mx-3 px-3`
 * bleed, which keeps the tint's left edge aligned with the rows above.
 */
export function Videos() {
  return (
    <ul className="pf-rule divide-y">
      {sortedVideos.map((video) => (
        <li key={video.url}>
          <a
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="pf-row -mx-3 block max-w-[calc(36rem+1.5rem)] px-3 py-4"
          >
            <span className="pf-frame pf-rule relative block aspect-video overflow-hidden border">
              <Image
                src={video.thumbnail}
                alt=""
                fill
                sizes="(min-width: 768px) 576px, 100vw"
                className="object-cover"
              />
            </span>

            <span className="mt-3 flex items-baseline gap-2">
              <span className="pf-title">{video.title}</span>
              <span aria-hidden="true" className="pf-row-arrow pf-meta">
                ↗
              </span>
            </span>

            <span className="pf-meta mt-0.5 block">YouTube</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
