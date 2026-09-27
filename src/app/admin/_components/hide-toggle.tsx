"use client";

import ViewIcon from "@hugeicons/core-free-icons/ViewIcon";
import ViewOffIcon from "@hugeicons/core-free-icons/ViewOffIcon";
import { HugeiconsIcon } from "@hugeicons/react";
import { useDraft } from "../_lib/draft";

export function HideToggle({
  path,
  label,
  labelled = false,
}: {
  path: string;
  label: string;
  labelled?: boolean;
}) {
  const draft = useDraft();
  const hidden = Boolean(draft.read(path));

  if (labelled) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={!hidden}
        aria-label={`Show ${label} on the site`}
        onClick={() => draft.setField(path, !hidden)}
        className="pf-button-quiet pf-visibility shrink-0"
        data-hidden={hidden || undefined}
      >
        <HugeiconsIcon
          icon={hidden ? ViewOffIcon : ViewIcon}
          size={15}
          strokeWidth={1.6}
          aria-hidden="true"
        />
        {hidden ? "Hidden" : "Visible"}
      </button>
    );
  }

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
