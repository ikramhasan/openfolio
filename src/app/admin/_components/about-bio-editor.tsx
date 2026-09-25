"use client";

import { normalizeStaticValue, type Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useState } from "react";
import { EditorKit } from "@/components/editor/editor-kit";
import "../../prose.css";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { TooltipProvider } from "@/components/ui/tooltip";
import { saveAboutBio } from "../_lib/actions";

type SaveState = "idle" | "saving" | "saved" | "failed";

export function AboutBioEditor({
  label,
  note,
  body,
}: {
  label: string;
  note?: string;
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

    saveAboutBio(JSON.stringify(editor.children)).then(
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
        <fieldset className="mt-10 min-w-0 first:mt-0">
          <div className="flex items-baseline justify-between gap-x-4">
            <legend className="pf-rule pf-column w-full border-b pb-2">
              {label}
            </legend>
          </div>

          {note ? <p className="pf-meta pf-faint mt-2">{note}</p> : null}

          <div className="pf-rule mt-3 overflow-hidden rounded-md border">
            <EditorContainer className="h-auto min-h-[16rem]">
              <Editor variant="none" className="pf-prose px-4 py-4" />
            </EditorContainer>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <button
              type="button"
              onClick={save}
              disabled={state === "saving" || !dirty}
              className="pf-button-quiet disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === "saving" ? "Saving…" : "Save bio"}
            </button>

            {message ? (
              <output
                className={
                  state === "failed" ? "pf-meta pf-strong" : "pf-meta pf-faint"
                }
              >
                {message}
              </output>
            ) : null}
          </div>
        </fieldset>
      </Plate>
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
