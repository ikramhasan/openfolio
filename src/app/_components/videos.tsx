import Image from "next/image";
import { getVideos } from "./content";
import { byOrder } from "./data";
import type { VideosSection } from "./types";

type Video = VideosSection["items"][number];

function Play() {
  return (
    <span aria-hidden="true" className="pf-play">
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <path d="M5 3.2v9.6a.6.6 0 0 0 .92.5l7.4-4.8a.6.6 0 0 0 0-1L5.92 2.7A.6.6 0 0 0 5 3.2z" />
      </svg>
    </span>
  );
}

function VideoCard({ video, featured }: { video: Video; featured: boolean }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer"
      className="pf-video group block"
    >
      <span className="pf-cover relative block aspect-video overflow-hidden rounded-[10px]">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt=""
            fill
            sizes={
              featured
                ? "(min-width: 1024px) 808px, 100vw"
                : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover"
          />
        ) : null}
        <Play />
      </span>

      <span
        className={`${featured ? "pf-feature-title" : "pf-title"} pf-video-title mt-3 block`}
      >
        {video.title}
      </span>
    </a>
  );
}

export async function Videos({ limit }: { limit?: number } = {}) {
  const { items } = await getVideos();
  const [first, ...rest] = byOrder(items).slice(0, limit);

  if (!first) return null;

  return (
    <div>
      <VideoCard video={first} featured />

      {rest.length ? (
        <ul className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2">
          {rest.map((video) => (
            <li key={video.url}>
              <VideoCard video={video} featured={false} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
