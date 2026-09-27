"use client";

import PencilEdit01Icon from "@hugeicons/core-free-icons/PencilEdit01Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useId, useRef, useState } from "react";
import { useDraft } from "../_lib/draft";
import { getPath } from "../_lib/paths";
import type { Block, Field } from "../_lib/schema";
import { AboutBioEditor } from "./about-bio-editor";
import { FieldInput } from "./fields";
import { GroupHeader } from "./group-header";
import { RecordsEditor } from "./record-list";
import { SectionToggle } from "./section-toggle";
import { SortableList, SortableRow } from "./sortable";

type FieldsBlock = Extract<Block, { kind: "fields" }>;

export function GroupEditor({
  blocks,
  aboutBio,
}: {
  blocks: Block[];
  aboutBio?: string | null;
}) {
  return (
    <div className="flex flex-col gap-14">
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

function FieldGrid({ block }: { block: FieldsBlock }) {
  return (
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
}

function FieldsEditor({ block }: { block: FieldsBlock }) {
  const draft = useDraft();
  const titleId = useId();
  const bodyId = useId();
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLButtonElement>(null);
  const focusAfter = useRef(false);

  useEffect(() => {
    if (!focusAfter.current) return;
    focusAfter.current = false;

    if (open) {
      bodyRef.current
        ?.querySelector<HTMLElement>("input:not([type=file]), textarea")
        ?.focus();
    } else {
      summaryRef.current?.focus();
    }
  }, [open]);

  function toggle(next: boolean) {
    focusAfter.current = true;
    setOpen(next);
  }

  const label = block.label ?? "Details";

  if (!block.collapsible) {
    return (
      <section aria-labelledby={titleId}>
        <GroupHeader id={titleId} title={label} note={block.note} />

        <div className="pt-5">
          <FieldGrid block={block} />
        </div>
      </section>
    );
  }

  const hidden = block.sectionToggle
    ? Boolean(draft.read(`sections.${block.sectionToggle}.hidden`))
    : false;

  return (
    <section aria-labelledby={titleId}>
      <GroupHeader
        id={titleId}
        title={label}
        note={block.note}
        actions={
          block.sectionToggle ? (
            <SectionToggle section={block.sectionToggle} />
          ) : null
        }
      />

      {open ? (
        <div id={bodyId} ref={bodyRef} className="pt-5">
          <FieldGrid block={block} />

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => toggle(false)}
              aria-expanded
              aria-controls={bodyId}
              className="pf-button-quiet"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          ref={summaryRef}
          onClick={() => toggle(true)}
          aria-expanded={false}
          className="pf-summary"
          data-hidden={hidden || undefined}
        >
          <FieldsPreview block={block} />

          <span className="pf-summary-edit">
            <HugeiconsIcon
              icon={PencilEdit01Icon}
              size={15}
              strokeWidth={1.6}
              aria-hidden="true"
            />
            Edit
            <span className="sr-only">{label.toLowerCase()}</span>
          </span>
        </button>
      )}
    </section>
  );
}

function FieldsPreview({ block }: { block: FieldsBlock }) {
  const draft = useDraft();
  const [lead, second, ...rest] = block.fields;

  const readField = (field: Field) =>
    String(draft.read(`${block.base}.${field.key}`) ?? "").trim();

  const fallbackOf = (field: Field) =>
    field.fallbackFrom
      ? String(draft.read(`${block.base}.${field.fallbackFrom}`) ?? "").trim()
      : "";

  const title = readField(lead);
  const subtitle = second ? readField(second) : "";

  return (
    <span className="grid min-w-0 flex-1 gap-y-1">
      <span className={title ? "pf-role-title" : "pf-role-title pf-faint"}>
        {title || `No ${lead.label.toLowerCase()}`}
      </span>

      {second ? (
        <span className={subtitle ? "pf-body" : "pf-body pf-faint"}>
          {subtitle || `No ${second.label.toLowerCase()}`}
        </span>
      ) : null}

      {rest.length > 0 ? (
        <span className="pf-meta mt-1 flex flex-wrap gap-x-5 gap-y-1">
          {rest.map((field) => {
            const value = readField(field);
            const fallback = fallbackOf(field);

            return (
              <span key={field.key} className="flex gap-x-2">
                <span className="pf-faint">{field.label}</span>
                <span className={value ? "pf-strong" : "pf-muted"}>
                  {value || fallback || "Not set"}
                </span>
              </span>
            );
          })}
        </span>
      ) : null}
    </span>
  );
}

function OrderEditor({ block }: { block: Extract<Block, { kind: "order" }> }) {
  const draft = useDraft();
  const titleId = useId();
  const unplacedId = useId();
  const ids = draft.readList(block.path).map(String);

  const titleOf = (id: string) =>
    String(getPath(draft.portfolio, `sections.${id}.title`) ?? id);

  const excluded = new Set(block.excludes ?? []);
  const unplaced = Object.keys(draft.portfolio.sections).filter(
    (id) => !excluded.has(id) && !ids.includes(id),
  );

  return (
    <div className="flex flex-col gap-14">
      <section aria-labelledby={titleId}>
        <GroupHeader id={titleId} title={block.label} count={ids.length} />

        <SortableList
          ids={ids}
          onMove={(from, to) => draft.moveRecord(block.path, from, to)}
        >
          {ids.map((id, index) => {
            const title = titleOf(id);

            return (
              <SortableRow key={id} id={id} label={title}>
                {(handle) => (
                  <div className="flex items-center gap-3 py-3">
                    {handle}

                    <span className="pf-meta pf-figure pf-faint w-5 shrink-0 text-right">
                      {index + 1}
                    </span>

                    <span className="pf-title min-w-0">{title}</span>
                  </div>
                )}
              </SortableRow>
            );
          })}
        </SortableList>
      </section>

      {unplaced.length > 0 ? (
        <section aria-labelledby={unplacedId}>
          <GroupHeader
            id={unplacedId}
            title="Unplaced"
            count={unplaced.length}
            note="Shown after the rest on the site. Place one to give it a position of its own."
          />

          <ul className="pf-rule divide-y">
            {unplaced.map((id) => (
              <li
                key={id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="pf-title min-w-0">{titleOf(id)}</span>

                <button
                  type="button"
                  onClick={() => draft.addRecord(block.path, id)}
                  className="pf-button-quiet shrink-0"
                >
                  Place
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
