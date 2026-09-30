import { createSlateEditor, type Value } from "platejs";
import { PlateStatic } from "platejs/static";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import {
  BaseSectionEmbedPlugin,
  SECTION_EMBED_KEY,
} from "@/components/editor/plugins/section-embed-base-plugin";
import { SectionEmbedBlock } from "./section-embed";
import "../prose.css";

export function ProseBody({ value }: { value: string }) {
  const parsed = parse(value);
  if (!parsed) return null;

  const editor = createSlateEditor({
    plugins: [
      ...BaseEditorKit.filter((plugin) => plugin.key !== SECTION_EMBED_KEY),
      BaseSectionEmbedPlugin.withComponent(SectionEmbedBlock),
    ],
    value: parsed,
  });

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
