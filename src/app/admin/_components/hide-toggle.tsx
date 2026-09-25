"use client";

import ViewIcon from "@hugeicons/core-free-icons/ViewIcon";
import ViewOffIcon from "@hugeicons/core-free-icons/ViewOffIcon";
import { HugeiconsIcon } from "@hugeicons/react";
import { useDraft } from "../_lib/draft";

export function HideToggle({ path, label }: { path: string; label: string }) {
  const draft = useDraft();
  const hidden = Boolean(draft.read(path));

  return (
    <button
      type="button"
      onClick={() => draft.setField(path, !hidden)}
      aria-pressed={hidden}
      aria-label={hidden ? `Show ${label}` : `Hide ${label}`}
      title={
        hidden ? `Hidden — click to show ${label}` : `Click to hide ${label}`
      }
      className="pf-hide-toggle shrink-0"
      data-hidden={hidden || undefined}
    >
      <HugeiconsIcon
        icon={hidden ? ViewOffIcon : ViewIcon}
        size={20}
        strokeWidth={1.5}
      />
    </button>
  );
}
