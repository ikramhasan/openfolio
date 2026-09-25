"use client";

import type { WritableSection } from "@convex/lib/writable";
import Link from "next/link";
import { normalizeStaticValue, type Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useState } from "react";
import { Toaster } from "sonner";
import { EditorKit } from "@/components/editor/editor-kit";
import "../../prose.css";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { TooltipProvider } from "@/components/ui/tooltip";
import { saveBody } from "../_lib/actions";

type SaveState = "idle" | "saving" | "saved" | "failed";

export function BodyEditor({
  section,
  slug,
  title,
  body,
  back,
  readPath,
}: {
  section: WritableSection;
  slug: string;
  title: string;
  body: string;
  back: { href: string; label: string };
  readPath: string;
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

    saveBody(section, slug, JSON.stringify(editor.children)).then(
      (result) => {
        if (!result.ok) {
          setState("failed");
          setMessage(result.error);
          return;
        }

        setDirty(false);
        setState("saved");
        setMessage("Saved. The page is live.");
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
          setState((current) => (current === "saving" ? current : "idle"));
          setMessage(null);
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <header className="pf-rule flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-b px-6 py-3 sm:px-8">
            <Link href={back.href} className="pf-link-quiet pf-meta shrink-0">
              ← {back.label}
            </Link>

            <span className="min-w-0 flex-1">
              <span className="pf-title block truncate">
                {title || "Untitled"}
              </span>
              <span className="pf-meta pf-faint block truncate">
                {readPath}
              </span>
            </span>

            <output className="pf-meta pf-muted shrink-0 text-right">
              {message}
            </output>

            <button
              type="button"
              onClick={save}
              disabled={state === "saving" || !dirty}
              className="pf-button shrink-0 rounded-full px-4 py-2 text-[0.8125rem] font-medium disabled:opacity-60"
            >
              {state === "saving" ? "Saving…" : "Save"}
            </button>
          </header>

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

function initial(body: string): Value {
  try {
    const parsed = JSON.parse(body);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return normalizeStaticValue(parsed as Value);
    }
  } catch {}

  return normalizeStaticValue([{ type: "p", children: [{ text: "" }] }]);
}
