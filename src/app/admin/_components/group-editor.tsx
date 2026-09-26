"use client";

import { useId, useState } from "react";
import { useDraft } from "../_lib/draft";
import { getPath } from "../_lib/paths";
import type { Block } from "../_lib/schema";
import { AboutBioEditor } from "./about-bio-editor";
import { FieldInput } from "./fields";
import { RecordsEditor } from "./record-list";
import { SectionToggle } from "./section-toggle";
import { SortableList, SortableRow } from "./sortable";

export function GroupEditor({
  blocks,
  aboutBio,
}: {
  blocks: Block[];
  aboutBio?: string | null;
}) {
  return (
    <div>
      {blocks.map((block) =>
        block.kind === "fields" ? (
          <FieldsEditor key={block.base} block={block} />
        ) : block.kind === "richText" ? (
          <AboutBioEditor
            key={block.label}
            label={block.label}
            note={block.note}
            body={aboutBio ?? ""}
          />
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
  const draft = useDraft();
  const bodyId = useId();
  const [open, setOpen] = useState(false);

  const grid = (
    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
      {block.fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          path={`${block.base}.${field.key}`}
        />
      ))}
    </div>
  );

  if (!block.collapsible) {
    return (
      <fieldset className="mt-10 first:mt-0">
        {block.label ? (
          <legend className="pf-rule pf-column mb-4 w-full border-b pb-2">
            {block.label}
          </legend>
        ) : null}

        {grid}
      </fieldset>
    );
  }

  const summary = String(
    draft.read(`${block.base}.${block.fields[0].key}`) ?? "",
  ).trim();

  return (
    <section className="mt-10 first:mt-0">
      <div className="pf-rule flex items-center gap-2 border-b pb-2">
        <h3 className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={open ? bodyId : undefined}
            className="pf-fold"
          >
            <span className="pf-column">{block.label}</span>

            {open ? null : (
              <span className="pf-meta pf-faint min-w-0 flex-1 truncate">
                {summary}
              </span>
            )}

            <span aria-hidden="true" className="pf-caret">
              ▾
            </span>
          </button>
        </h3>

        {block.sectionToggle ? (
          <SectionToggle section={block.sectionToggle} />
        ) : null}
      </div>

      {open ? (
        <div id={bodyId} className="pt-5">
          {grid}
        </div>
      ) : null}
    </section>
  );
}

function OrderEditor({ block }: { block: Extract<Block, { kind: "order" }> }) {
  const draft = useDraft();
  const ids = draft.readList(block.path).map(String);

  const titleOf = (id: string) =>
    String(getPath(draft.portfolio, `sections.${id}.title`) ?? id);

  const excluded = new Set(block.excludes ?? []);
  const unplaced = Object.keys(draft.portfolio.sections).filter(
    (id) => !excluded.has(id) && !ids.includes(id),
  );

  return (
    <section>
      <h3 className="pf-rule pf-column border-b pb-2">{block.label}</h3>

      <SortableList
        ids={ids}
        onMove={(from, to) => draft.moveRecord(block.path, from, to)}
      >
        {ids.map((id, index) => {
          const title = titleOf(id);

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

      {unplaced.length > 0 ? (
        <div className="mt-10">
          <h3 className="pf-rule pf-column border-b pb-2">Unplaced</h3>

          <p className="pf-meta mt-2">
            Shown after the rest on the site. Place one to give it a position of
            its own.
          </p>

          <ol className="pf-rule mt-1 divide-y">
            {unplaced.map((id) => (
              <li
                key={id}
                className="flex items-center justify-between gap-2 py-2.5"
              >
                <span className="pf-title truncate">{titleOf(id)}</span>

                <button
                  type="button"
                  onClick={() => draft.addRecord(block.path, id)}
                  className="pf-button-quiet shrink-0"
                >
                  Place
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
