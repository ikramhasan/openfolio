"use client";

import PinIcon from "@hugeicons/core-free-icons/PinIcon";
import { HugeiconsIcon } from "@hugeicons/react";
import { useDraft } from "../_lib/draft";

export function PinToggle({ path, label }: { path: string; label: string }) {
  const draft = useDraft();
  const pinned = Boolean(draft.read(path));

  return (
    <button
      type="button"
      onClick={() => draft.setField(path, !pinned)}
      aria-pressed={pinned}
      aria-label={pinned ? `Unpin ${label}` : `Pin ${label}`}
      title={
        pinned ? `Pinned — click to unpin ${label}` : `Click to pin ${label}`
      }
      className="pf-hide-toggle shrink-0"
      data-pinned={pinned || undefined}
    >
      <HugeiconsIcon icon={PinIcon} size={18} strokeWidth={1.5} />
    </button>
  );
}
