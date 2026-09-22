"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useDraft } from "../_lib/draft";
import { getPath, move } from "../_lib/paths";
import type { Block } from "../_lib/schema";
import { FieldInput } from "./fields";
import { SortableList, SortableRow } from "./sortable";

/**
 * A list of records. Rows carry a key of their own, so reordering moves the row
 * rather than rewriting the one in that slot: React keeps the DOM node, the
 * browser keeps `:hover` and the open row on it, and all three follow the record.
 */

type RecordsBlock = Extract<Block, { kind: "records" }>;

const keysFor = (count: number) => Array.from({ length: count }, (_, at) => at);

export function RecordsEditor({ block }: { block: RecordsBlock }) {
  const draft = useDraft();
  const items = draft.readList(block.path);
  const [openKey, setOpenKey] = useState<number | null>(null);
  const [confirmKey, setConfirmKey] = useState<number | null>(null);
  const [rowKeys, setRowKeys] = useState(() => keysFor(items.length));

  // The list can also change from outside this component — a discard, say.
  const keys =
    rowKeys.length === items.length ? rowKeys : keysFor(items.length);

  const options = { orderKey: block.orderKey };
  const sortable = block.sortable !== false && items.length > 1;

  function add() {
    const key = keys.reduce((highest, at) => Math.max(highest, at), -1) + 1;

    draft.addRecord(block.path, structuredClone(block.record.blank), options);
    setRowKeys([...keys, key]);
    setConfirmKey(null);
    setOpenKey(key);
  }

  function remove(index: number) {
    draft.removeRecord(block.path, index, options);
    setRowKeys(keys.filter((_, at) => at !== index));
    setConfirmKey(null);
    setOpenKey(null);
  }

  function reorder(from: number, to: number) {
    draft.moveRecord(block.path, from, to, options);
    setRowKeys(move(keys, from, to));
  }

  function row(index: number, handle?: ReactNode) {
    const key = keys[index];

    return (
      <Record
        block={block}
        index={index}
        handle={handle}
        open={openKey === key}
        confirming={confirmKey === key}
        onToggle={() => setOpenKey(openKey === key ? null : key)}
        onConfirming={(asking) => setConfirmKey(asking ? key : null)}
        onRemove={() => remove(index)}
      />
    );
  }

  return (
    <section className="mt-10">
      <div className="pf-rule flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b pb-2">
        <h3 className="pf-column">
          {block.label}
          <span className="pf-faint pf-figure ml-2">{items.length}</span>
        </h3>

        <button type="button" onClick={add} className="pf-button-quiet">
          {block.addLabel}
        </button>
      </div>

      {block.note ? <p className="pf-meta mt-2">{block.note}</p> : null}

      {items.length === 0 ? (
        <p className="pf-meta pf-faint mt-4">Nothing here yet.</p>
      ) : sortable ? (
        <SortableList ids={keys.map(String)} onMove={reorder}>
          {items.map((item, index) => (
            <SortableRow
              key={keys[index]}
              id={String(keys[index])}
              label={summaryOf(block, item)}
            >
              {(handle) => row(index, handle)}
            </SortableRow>
          ))}
        </SortableList>
      ) : (
        <ol className="pf-rule divide-y">
          {items.map((_, index) => (
            <li key={keys[index]}>{row(index)}</li>
          ))}
        </ol>
      )}
    </section>
  );
}

function summaryOf(block: RecordsBlock, item: unknown): string {
  return (
    String(getPath(item, block.record.summaryKey) ?? "").trim() || "Untitled"
  );
}

function Record({
  block,
  index,
  handle,
  open,
  confirming,
  onToggle,
  onConfirming,
  onRemove,
}: {
  block: RecordsBlock;
  index: number;
  handle?: ReactNode;
  open: boolean;
  confirming: boolean;
  onToggle: () => void;
  onConfirming: (asking: boolean) => void;
  onRemove: () => void;
}) {
  const draft = useDraft();
  const bodyId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  const item = draft.readList(block.path)[index];
  const summary = summaryOf(block, item);

  // The button that was clicked is replaced by this one, so without the move the
  // keyboard is left back at the top of the document.
  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  return (
    <div className="pf-record">
      <div className="flex items-center gap-1 py-1.5">
        {handle}

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          // The body is only in the DOM while it is open, and a dangling
          // `aria-controls` is worse than none.
          aria-controls={open ? bodyId : undefined}
          className="pf-record-toggle"
        >
          <span className="pf-meta pf-figure pf-faint shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="pf-title truncate">{summary}</span>
          <span aria-hidden="true" className="pf-caret">
            ▾
          </span>
        </button>

        {confirming ? (
          <span className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              ref={confirmRef}
              onClick={onRemove}
              className="pf-button-quiet"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => onConfirming(false)}
              className="pf-button-quiet"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onConfirming(true)}
            aria-label={`Remove ${summary}`}
            className="pf-button-quiet shrink-0"
          >
            Remove
          </button>
        )}
      </div>

      {open ? (
        <div id={bodyId} className="pf-record-body">
          {block.record.fields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              path={`${block.path}.${index}.${field.key}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
