"use client";

import { useDraft } from "../_lib/draft";

/** The only place a change leaves the editor. */

const MESSAGE = {
  idle: "",
  saving: "Saving…",
  saved:
    "Saved to the draft. Nothing is written yet — the repository has no backend.",
  failed: "Could not save. Nothing was lost; try again.",
} as const;

// Shared by both dock buttons, so the pair differs only in fill.
const SHAPE = "rounded-md px-4 py-2 text-[0.8125rem] font-medium";

export function SaveDock() {
  const { dirty, saveState, save, discard } = useDraft();
  const message = MESSAGE[saveState];

  if (!dirty && !message) return null;

  return (
    <div className="pf-dock">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 sm:px-10">
        <p className="pf-meta min-w-0 flex-1">
          {dirty ? <span className="pf-strong">Unsaved changes</span> : null}
          {dirty && message ? <span aria-hidden="true"> · </span> : null}
          {/* Rendered even when empty, so the message is announced when it lands. */}
          <output className="pf-muted">{message}</output>
        </p>

        {dirty ? (
          <span className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={discard}
              className={`pf-button-outline ${SHAPE}`}
            >
              Discard
            </button>

            <button
              type="button"
              onClick={save}
              disabled={saveState === "saving"}
              className={`pf-button ${SHAPE} disabled:opacity-60`}
            >
              {saveState === "saving" ? "Saving…" : "Save"}
            </button>
          </span>
        ) : null}
      </div>
    </div>
  );
}
