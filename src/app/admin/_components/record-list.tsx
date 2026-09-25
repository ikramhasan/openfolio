"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { slugOf } from "../../_components/writing";
import { useDraft } from "../_lib/draft";
import { getPath, move } from "../_lib/paths";
import type { Block } from "../_lib/schema";
import { FieldInput } from "./fields";
import { HideToggle } from "./hide-toggle";
import { SortableList, SortableRow } from "./sortable";

type RecordsBlock = Extract<Block, { kind: "records" }>;

const keysFor = (count: number) => Array.from({ length: count }, (_, at) => at);

export function RecordsEditor({ block }: { block: RecordsBlock }) {
  const draft = useDraft();
  const items = draft.readList(block.path);
  const [openKey, setOpenKey] = useState<number | null>(null);
  const [confirmKey, setConfirmKey] = useState<number | null>(null);
  const [rowKeys, setRowKeys] = useState(() => keysFor(items.length));

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

function suggestionsFor(items: unknown[], key: string): string[] {
  const seen = new Map<string, string>();

  for (const item of items) {
    const value = String(getPath(item, key) ?? "").trim();
    if (value && !seen.has(value.toLowerCase())) {
      seen.set(value.toLowerCase(), value);
    }
  }

  return [...seen.values()].sort((a, b) => a.localeCompare(b));
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

  const items = draft.readList(block.path);
  const item = items[index];
  const summary = summaryOf(block, item);
  const hidden = Boolean(getPath(item, "hidden"));

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  return (
    <div className="pf-record" data-hidden={hidden || undefined}>
      <div className="flex items-center gap-1 py-1.5">
        {handle}

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
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

        {"hidden" in block.record.blank ? (
          <HideToggle path={`${block.path}.${index}.hidden`} label={summary} />
        ) : null}

        {block.page ? <PageLink block={block} index={index} /> : null}

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
              suggestions={
                field.suggest ? suggestionsFor(items, field.key) : undefined
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PageLink({ block, index }: { block: RecordsBlock; index: number }) {
  const draft = useDraft();
  const page = block.page;
  if (!page) return null;

  const item = draft.readList(block.path)[index];
  const address = slugOf({
    title: String(getPath(item, "title") ?? ""),
    slug: String(getPath(item, "slug") ?? ""),
  });

  if (!address) {
    return (
      <span className="pf-meta pf-faint shrink-0 px-2.5">Needs a title</span>
    );
  }

  return (
    <Link
      href={`${page.basePath}/${address}`}
      className="pf-button-quiet shrink-0"
    >
      {page.label}
    </Link>
  );
}
