"use client";

import Link from "next/link";
import { normalizeStaticValue, type Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useState } from "react";
import { Toaster } from "sonner";
import { EditorKit } from "@/components/editor/editor-kit";
import "../../prose.css";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { TooltipProvider } from "@/components/ui/tooltip";
import { saveArticle } from "../_lib/actions";

/**
 * One post's body, in Plate, filling the window.
 *
 * A writing surface wants height above everything else, so the page carries only what
 * it cannot do without: where you came from, what you are writing, and the save. The
 * portfolio's rail and its draft of the whole document belong to the content groups,
 * which is why this route sits outside them.
 *
 * Its own working copy rather than the portfolio draft: the body is not part of the
 * wire payload, and this page saves on its own. `dirty` is a flag rather than a
 * comparison, because the alternative is serialising the document on every keystroke
 * to find out.
 *
 * `value` is the editor's initial document only. Plate owns it from then on, and the
 * save reads `editor.children` — passing the state back in would fight the editor for
 * the caret.
 */

type SaveState = "idle" | "saving" | "saved" | "failed";

export function ArticleEditor({
  slug,
  title,
  body,
}: {
  slug: string;
  title: string;
  body: string;
}) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initial(body),
  });

  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  function save() {
    setState("saving");
    setMessage(null);

    saveArticle(slug, JSON.stringify(editor.children)).then(
      (result) => {
        if (!result.ok) {
          setState("failed");
          setMessage(result.error);
          return;
        }

        setDirty(false);
        setState("saved");
        setMessage("Saved. The post is live.");
      },
      () => {
        setState("failed");
        setMessage("Could not reach the server. Try again.");
      },
    );
  }

  return (
    <TooltipProvider>
      <Plate
        editor={editor}
        onChange={() => {
          setDirty(true);
          // An edit mid-save must not return the bar to idle: that would re-enable
          // Save and let a second write overtake the first.
          setState((current) => (current === "saving" ? current : "idle"));
          setMessage(null);
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <header className="pf-rule flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-b px-6 py-3 sm:px-8">
            <Link
              href="/admin/articles"
              className="pf-link-quiet pf-meta shrink-0"
            >
              ← Articles
            </Link>

            <span className="min-w-0 flex-1">
              <span className="pf-title block truncate">
                {title || "Untitled"}
              </span>
              <span className="pf-meta pf-faint block truncate">
                /articles/{slug}
              </span>
            </span>

            {/* Whether there is anything to save is what the button's own state says;
              this is only for what a finished save had to report. */}
            <output className="pf-meta pf-muted shrink-0 text-right">
              {message}
            </output>

            <button
              type="button"
              onClick={save}
              disabled={state === "saving" || !dirty}
              className="pf-button shrink-0 rounded-md px-4 py-2 text-[0.8125rem] font-medium disabled:opacity-60"
            >
              {state === "saving" ? "Saving…" : "Save"}
            </button>
          </header>

          {/*
            `min-h-0` is what lets the editable take the rest of the window and scroll
            inside itself rather than growing the page; `pf-prose` is the published
            column, so what is being written looks like what will be read.
          */}
          {/* `h-auto` displaces the container's own `h-full`, which would make it a
              full viewport tall underneath the header and push the page into a
              scroll. */}
          <EditorContainer className="h-auto min-h-0 flex-1">
            <Editor
              variant="none"
              className="pf-prose mx-auto w-full max-w-3xl px-6 pt-10 pb-[40vh] sm:px-8"
            />
          </EditorContainer>
        </div>
      </Plate>

      <Toaster position="bottom-center" />
    </TooltipProvider>
  );
}

/**
 * A body that is not the JSON this wrote opens as one empty paragraph rather than
 * throwing — an editor that will not load is worse than one that starts blank.
 * `normalizeStaticValue` fills in the ids the block handles and comments key off.
 */
function initial(body: string): Value {
  try {
    const parsed = JSON.parse(body);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return normalizeStaticValue(parsed as Value);
    }
  } catch {
    // Falls through to the empty document.
  }

  return normalizeStaticValue([{ type: "p", children: [{ text: "" }] }]);
}
