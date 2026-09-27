"use client";

import ArrowDown01Icon from "@hugeicons/core-free-icons/ArrowDown01Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { faviconUrl, hostOf } from "../../_components/data";
import { slugOf } from "../../_components/writing";
import { useDraft } from "../_lib/draft";
import { getPath, move, setPath } from "../_lib/paths";
import type { Block, BulkUpload } from "../_lib/schema";
import { MAX_BYTES, readImageSize, uploadFile } from "../_lib/upload";
import { dayDate } from "./day-date";
import { FieldInput } from "./fields";
import { GroupHeader } from "./group-header";
import { HideToggle } from "./hide-toggle";
import { SortableList, SortableRow } from "./sortable";

type RecordsBlock = Extract<Block, { kind: "records" }>;

const keysFor = (count: number) => Array.from({ length: count }, (_, at) => at);

export function RecordsEditor({ block }: { block: RecordsBlock }) {
  const draft = useDraft();
  const titleId = useId();
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

  function addMany(records: unknown[]) {
    if (records.length === 0) return;

    const first = keys.reduce((highest, at) => Math.max(highest, at), -1) + 1;

    for (const record of records) {
      draft.addRecord(block.path, record, options);
    }

    setRowKeys([...keys, ...keysFor(records.length).map((at) => first + at)]);
    setConfirmKey(null);
    setOpenKey(null);
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
        onToggle={() => {
          setConfirmKey(null);
          setOpenKey(openKey === key ? null : key);
        }}
        onConfirming={(asking) => setConfirmKey(asking ? key : null)}
        onRemove={() => remove(index)}
      />
    );
  }

  return (
    <section aria-labelledby={titleId}>
      <GroupHeader
        id={titleId}
        title={block.label}
        count={items.length}
        note={block.note}
        actions={
          <>
            {block.bulkUpload ? (
              <BulkUploader
                bulk={block.bulkUpload}
                blank={block.record.blank}
                onDone={addMany}
              />
            ) : null}

            <button type="button" onClick={add} className="pf-button-quiet">
              {block.addLabel}
            </button>
          </>
        }
      />

      {items.length === 0 ? (
        <p className="pf-meta pf-faint py-6">Nothing here yet.</p>
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

const PARALLEL_UPLOADS = 3;

function BulkUploader({
  bulk,
  blank,
  onDone,
}: {
  bulk: BulkUpload;
  blank: Record<string, unknown>;
  onDone: (records: unknown[]) => void;
}) {
  const draft = useDraft();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function uploadOne(file: File): Promise<unknown> {
    const [token, size] = await Promise.all([
      uploadFile(file),
      bulk.probeSize
        ? readImageSize(file).catch(() => undefined)
        : Promise.resolve(undefined),
    ]);

    draft.registerUpload(token, URL.createObjectURL(file));

    let record: unknown = setPath(structuredClone(blank), bulk.key, token);
    if (size) {
      record = setPath(record, "width", size.width);
      record = setPath(record, "height", size.height);
    }

    return record;
  }

  async function run(files: File[]) {
    setMessage(null);

    const accepted = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= MAX_BYTES,
    );
    const skipped = files.length - accepted.length;
    const results: (unknown | null)[] = accepted.map(() => null);
    let done = 0;
    let next = 0;

    setProgress({ done, total: accepted.length });

    async function worker() {
      while (next < accepted.length) {
        const at = next++;

        try {
          results[at] = await uploadOne(accepted[at]);
        } catch {
          results[at] = null;
        }

        done += 1;
        setProgress({ done, total: accepted.length });
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(PARALLEL_UPLOADS, accepted.length) }, () =>
        worker(),
      ),
    );

    const records = results.filter((record) => record !== null);
    const failed = accepted.length - records.length;

    onDone(records);
    setProgress(null);
    if (input.current) input.current.value = "";

    const problems = [
      skipped > 0 ? `${skipped} skipped — not an image or over 8 MB` : "",
      failed > 0 ? `${failed} failed to upload` : "",
    ].filter(Boolean);

    setMessage(
      problems.length > 0
        ? `Added ${records.length}. ${problems.join(", ")}.`
        : null,
    );
  }

  const busy = progress !== null;

  return (
    <>
      {busy ? (
        <output className="pf-meta pf-muted pf-figure">
          Uploading {progress.done} of {progress.total}…
        </output>
      ) : message ? (
        <output className="pf-meta pf-strong">{message}</output>
      ) : null}

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        tabIndex={-1}
        aria-hidden="true"
        disabled={busy}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) void run(files);
        }}
        className="sr-only"
      />

      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="pf-button-quiet disabled:cursor-not-allowed disabled:opacity-60"
      >
        {bulk.label}
      </button>
    </>
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

function metaText(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry).trim())
      .filter(Boolean)
      .join(", ");
  }

  const text = String(value ?? "").trim();
  if (/^https?:\/\//i.test(text)) return hostOf(text);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return dayDate(text) || text;

  return text;
}

function metaOf(block: RecordsBlock, item: unknown): string[] {
  return (block.record.metaKeys ?? [])
    .map((key) => metaText(getPath(item, key)))
    .filter(Boolean);
}

function nounOf(block: RecordsBlock): string {
  return block.addLabel.replace(/^add\s+/i, "");
}

function RecordThumb({ block, item }: { block: RecordsBlock; item: unknown }) {
  const draft = useDraft();
  const image = block.record.image;
  if (!image) return null;

  const own = image.key ? String(getPath(item, image.key) ?? "").trim() : "";
  const token =
    own ||
    (image.from ? faviconUrl(String(getPath(item, image.from) ?? "")) : "");
  const src = token.startsWith("storage:") ? draft.previewFor(token) : token;

  return (
    <span className="pf-record-thumb" data-shape={image.shape ?? "logo"}>
      {src ? (
        // biome-ignore lint/performance/noImgElement: an arbitrary, unoptimisable host
        <img src={src} alt="" className="size-full" />
      ) : null}
    </span>
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
  const toggleRef = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);

  const items = draft.readList(block.path);
  const item = items[index];
  const summary = summaryOf(block, item);
  const meta = metaOf(block, item);
  const hidden = Boolean(getPath(item, "hidden"));
  const noun = nounOf(block);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  useEffect(() => {
    if (open || !refocus.current) return;
    refocus.current = false;
    toggleRef.current?.focus();
  }, [open]);

  function close() {
    refocus.current = true;
    onToggle();
  }

  return (
    <div
      className="pf-record"
      data-hidden={hidden || undefined}
      data-open={open || undefined}
      data-indent={handle ? true : undefined}
    >
      <div className="pf-record-row">
        {handle}

        <button
          type="button"
          ref={toggleRef}
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={open ? bodyId : undefined}
          className="pf-record-toggle"
        >
          <RecordThumb block={block} item={item} />

          <span className="min-w-0 flex-1">
            <span className="pf-title block">{summary}</span>

            {hidden || meta.length > 0 ? (
              <span className="pf-meta mt-0.5 flex flex-wrap gap-x-2.5">
                {hidden ? <span className="pf-strong">Hidden</span> : null}
                {meta.map((value, at) => (
                  <span
                    key={`${at}-${value}`}
                    className={at === 0 ? "pf-muted" : "pf-faint"}
                  >
                    {value}
                  </span>
                ))}
              </span>
            ) : null}
          </span>
        </button>

        <div className="pf-record-actions">
          {block.page ? <PageLink block={block} index={index} /> : null}

          {"hidden" in block.record.blank ? (
            <HideToggle
              path={`${block.path}.${index}.hidden`}
              label={summary}
            />
          ) : null}

          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={onToggle}
            className="pf-chevron-button"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} size={18} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {open ? (
        <div id={bodyId} className="pf-record-body">
          <div className="pf-record-fields">
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

          <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            {confirming ? (
              <span className="flex flex-wrap items-center gap-2">
                <span className="pf-meta pf-strong">Remove this {noun}?</span>
                <button
                  type="button"
                  ref={confirmRef}
                  onClick={onRemove}
                  className="pf-button-quiet pf-button-danger"
                >
                  Remove
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
                className="pf-link-quiet pf-meta"
              >
                Remove {noun}
              </button>
            )}

            <button type="button" onClick={close} className="pf-button-quiet">
              Done
            </button>
          </div>
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
