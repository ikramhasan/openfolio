import Image from "next/image";
import { sortedVideos } from "./data";

/**
 * Videos, as stills at card width rather than a grid — the source holds one item.
 *
 * The anchor is capped at the card's width so the hover tint hugs the still. The
 * extra `1.5rem` is the `-mx-3 px-3` bleed, keeping its left edge aligned with the
 * rows in other sections.
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
