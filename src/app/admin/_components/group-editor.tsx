"use client";

import { useDraft } from "../_lib/draft";
import { getPath } from "../_lib/paths";
import type { Block } from "../_lib/schema";
import { FieldInput } from "./fields";
import { RecordsEditor } from "./record-list";
import { SortableList, SortableRow } from "./sortable";

export function GroupEditor({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((block) =>
        block.kind === "fields" ? (
          <FieldsEditor key={`${block.base}.${block.label}`} block={block} />
        ) : block.kind === "records" ? (
          <RecordsEditor key={block.path} block={block} />
        ) : (
          <OrderEditor key={block.path} block={block} />
        ),
      )}
    </div>
  );
}

function FieldsEditor({
  block,
}: {
  block: Extract<Block, { kind: "fields" }>;
}) {
  return (
    <fieldset className="mt-10 first:mt-0">
      <legend className="pf-rule pf-column mb-4 w-full border-b pb-2">
        {block.label}
      </legend>

      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        {block.fields.map((field) => (
          <FieldInput
            key={field.key}
            field={field}
            path={`${block.base}.${field.key}`}
          />
        ))}
      </div>
    </fieldset>
  );
}

/**
 * The section order: a list of ids, not records. Headings are read from the draft
 * so a renamed section shows its new name here.
 */
function OrderEditor({ block }: { block: Extract<Block, { kind: "order" }> }) {
  const draft = useDraft();
  const ids = draft.readList(block.path).map(String);

  return (
    <section>
      <h3 className="pf-rule pf-column border-b pb-2">{block.label}</h3>

      <SortableList
        ids={ids}
        onMove={(from, to) => draft.moveRecord(block.path, from, to)}
      >
        {ids.map((id, index) => {
          const title = String(
            getPath(draft.portfolio, `sections.${id}.title`) ?? id,
          );

          return (
            <SortableRow key={id} id={id} label={title}>
              {(handle) => (
                <div className="flex items-center gap-2 py-2.5">
                  {handle}

                  <span className="pf-meta pf-figure pf-faint shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="pf-title truncate">{title}</span>
                </div>
              )}
            </SortableRow>
          );
        })}
      </SortableList>
    </section>
  );
}
