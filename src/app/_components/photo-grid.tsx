"use client";

import ArrowLeft01Icon from "@hugeicons/core-free-icons/ArrowLeft01Icon";
import ArrowRight01Icon from "@hugeicons/core-free-icons/ArrowRight01Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Photo } from "./types";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  return (
    <>
      <div className="columns-2 gap-2 sm:columns-3 sm:gap-2.5 [&>*]:mb-2 sm:[&>*]:mb-2.5">
        {photos.map((photo, index) => (
          <button
            key={photo.url}
            type="button"
            onClick={() => setOpenAt(index)}
            aria-label={`Open ${photo.title || photo.alt || "photograph"} full screen`}
            className="pf-frame pf-row block w-full break-inside-avoid overflow-hidden"
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
          >
            <span className="relative block size-full">
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </span>
          </button>
        ))}
      </div>

      {openAt !== null ? (
        <PhotoLightbox
          photos={photos}
          index={openAt}
          onIndexChange={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      ) : null}
    </>
  );
}

function PhotoLightbox({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: Photo[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const count = photos.length;
  const photo = photos[index];

  const previous = useCallback(
    () => onIndexChange((index - 1 + count) % count),
    [count, index, onIndexChange],
  );

  const next = useCallback(
    () => onIndexChange((index + 1) % count),
    [count, index, onIndexChange],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") previous();
      else if (event.key === "ArrowRight") next();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, previous, next]);

  useEffect(() => {
    const { style } = document.body;
    const previous = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = previous;
    };
  }, []);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: closes on backdrop click; controls are separately focusable
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.title || photo.alt || "Photograph"}
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      onClick={onClose}
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
        <span className="pf-meta pf-figure text-white/70">
          {index + 1} / {count}
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-full p-1.5 text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-6 sm:pb-6">
        <div
          className="relative max-h-full max-w-full"
          style={{
            aspectRatio: `${photo.width} / ${photo.height}`,
            width: "min(100%, calc((100vh - 8rem) * (" +
              photo.width +
              " / " +
              photo.height +
              ")))",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <Image
            key={photo.url}
            src={photo.url}
            alt={photo.alt}
            fill
            sizes="100vw"
            priority
            className="object-contain"
          />
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                previous();
              }}
              aria-label="Previous photograph"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 sm:left-4"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                next();
              }}
              aria-label="Next photograph"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 sm:right-4"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={28} strokeWidth={1.5} />
            </button>
          </>
        ) : null}
      </div>

      {photo.title ? (
        <p className="pf-meta shrink-0 px-4 pb-4 text-center text-white/70 sm:px-6">
          {photo.title}
        </p>
      ) : null}
    </div>
  );
}
