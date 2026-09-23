import { createSlateEditor, type Value } from "platejs";
import { PlateStatic } from "platejs/static";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import "../prose.css";

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
