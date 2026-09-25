"use client";

import { useDraft } from "../_lib/draft";

const SHAPE = "rounded-full px-4 py-2 text-[0.8125rem] font-medium";

export function SaveDock() {
  const { dirty, saveState, saveMessage, save, discard } = useDraft();
  const message = saveState === "saving" ? "Saving…" : saveMessage;

  if (!dirty && !message) return null;

  return (
    <div className="pf-dock">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 sm:px-10">
        <p className="pf-meta min-w-0 flex-1">
          {dirty ? <span className="pf-strong">Unsaved changes</span> : null}
          {dirty && message ? <span aria-hidden="true"> · </span> : null}
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
