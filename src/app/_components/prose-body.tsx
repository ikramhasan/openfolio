import { createSlateEditor, type Value } from "platejs";
import { PlateStatic } from "platejs/static";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import "../prose.css";

/**
 * A stored rich-text body, rendered without the editor. Articles use it today; any
 * other section given a written body would render through the same component.
 *
 * `BaseEditorKit` is the same plugin set the editor uses, minus everything
 * interactive, so a heading, a table or a code block comes out of the server as
 * markup rather than as a React island. Nothing here ships to the browser.
 *
 * `PlateStatic` directly rather than the registry's `EditorStatic`, whose container
 * is an editor's: a text cursor, a placeholder colour, `whitespace-break-spaces`
 * and a `font-bold` override on every `strong`. What the body looks like is
 * `app/prose.css`.
 *
 * A body that is not the JSON the editor wrote renders as nothing rather than
 * throwing: the page's own copy is already on screen by then.
 */
export function ProseBody({ value }: { value: string }) {
  const parsed = parse(value);
  if (!parsed) return null;

  const editor = createSlateEditor({ plugins: BaseEditorKit, value: parsed });

  return <PlateStatic editor={editor} className="pf-prose" />;
}

function parse(value: string): Value | null {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as Value) : null;
  } catch {
    return null;
  }
}
