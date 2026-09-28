"use client";

import { normalizeStaticValue, type Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useId, useState } from "react";
import { EditorKit } from "@/components/editor/editor-kit";
import "../../prose.css";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { TooltipProvider } from "@/components/ui/tooltip";
import { saveAboutBio } from "../_lib/actions";
import { GroupHeader } from "./group-header";

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
    plugins: [...EditorKit],
    value: initial(body),
  });

  const titleId = useId();
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
        <section aria-labelledby={titleId} className="min-w-0">
          <GroupHeader id={titleId} title={label} note={note} />

          <div className="pf-rule mt-5 overflow-hidden rounded-md border">
            <EditorContainer className="h-auto min-h-[16rem]">
              <Editor variant="none" className="pf-prose px-4 py-4" />
            </EditorContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
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
        </section>
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
