"use client";

import { useId, useRef, useState } from "react";
import { createUploadUrl } from "../_lib/actions";
import { useDraft } from "../_lib/draft";
import type { Field, FieldKind } from "../_lib/schema";

/**
 * One input per schema field, bound to the draft by path.
 *
 * `tags` and `lines` hold `string[]`, so the parse on change has to round-trip
 * exactly — trimming there would fight the caret. They are tidied on blur.
 */

function toInput(kind: FieldKind, value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(kind === "tags" ? "," : "\n");
  return String(value);
}

function fromInput(kind: FieldKind, raw: string, previous: unknown): unknown {
  switch (kind) {
    case "tags":
      return raw.split(",");
    case "lines":
      return raw.split("\n");
    case "number": {
      if (raw === "") return 0;
      const next = Number(raw);
      return Number.isFinite(next) ? next : previous;
    }
    default:
      return raw;
  }
}

// Returns the value it was given when nothing needed tidying, so a focus and blur
// with no edit does not count as a change.
function tidy(kind: FieldKind, value: unknown): unknown {
  if (kind !== "tags" && kind !== "lines") return value;
  if (!Array.isArray(value)) return value;

  const next = value.map((entry) => String(entry).trim()).filter(Boolean);
  const same =
    next.length === value.length &&
    next.every((entry, index) => entry === value[index]);

  return same ? value : next;
}

export function FieldInput({ path, field }: { path: string; field: Field }) {
  const draft = useDraft();
  const id = useId();

  const value = draft.read(path);
  const text = toInput(field.kind, value);
  const describedBy = field.hint ? `${id}-hint` : undefined;

  const multiline = field.kind === "textarea" || field.kind === "lines";
  const type =
    field.kind === "url"
      ? "url"
      : field.kind === "number"
        ? "number"
        : field.kind === "date"
          ? "date"
          : "text";

  const commit = (raw: string) => {
    draft.setField(path, fromInput(field.kind, raw, value));
  };

  return (
    <div className={field.wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="pf-column block">
        {field.label}
      </label>

      <div className="mt-1.5 flex items-start gap-2">
        {field.kind === "image" ? <Thumbnail token={text} /> : null}

        {multiline ? (
          <textarea
            id={id}
            value={text}
            rows={field.kind === "lines" ? 5 : 3}
            aria-describedby={describedBy}
            onChange={(event) => commit(event.target.value)}
            onBlur={() => draft.setField(path, tidy(field.kind, value))}
            className="pf-field pf-input min-w-0 flex-1 resize-y"
          />
        ) : (
          <input
            id={id}
            type={type}
            value={text}
            inputMode={field.kind === "number" ? "numeric" : undefined}
            aria-describedby={describedBy}
            onChange={(event) => commit(event.target.value)}
            onBlur={() => draft.setField(path, tidy(field.kind, value))}
            className="pf-field pf-input min-w-0 flex-1"
          />
        )}
      </div>

      {field.kind === "image" ? (
        <Upload path={path} label={field.label} />
      ) : null}

      {field.hint ? (
        <p id={describedBy} className="pf-meta pf-faint mt-1.5">
          {field.hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * An uploader beside the text input, so an image can be either a file on the
 * deployment or a URL on someone else's CDN.
 *
 * The bytes go straight from the browser to Convex, which hands back a storage id.
 * What lands in the draft is `storage:<id>`, not the URL that id currently resolves
 * to: those are minted on read and must not be stored.
 */
const MAX_BYTES = 8 * 1024 * 1024;

function Upload({ path, label }: { path: string; label: string }) {
  const draft = useDraft();
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "busy">("idle");
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("That is not an image.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("Too large — 8 MB is the limit.");
      return;
    }

    setState("busy");

    try {
      const url = await createUploadUrl();
      if (!url) throw new Error("no upload url");

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) throw new Error(`upload failed: ${response.status}`);

      const { storageId } = (await response.json()) as { storageId: string };
      const token = `storage:${storageId}`;

      draft.registerUpload(token, URL.createObjectURL(file));
      draft.setField(path, token);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setState("idle");
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
      <input
        ref={input}
        type="file"
        accept="image/*"
        aria-label={`Upload ${label.toLowerCase()}`}
        disabled={state === "busy"}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
        className="pf-meta pf-faint min-w-0 max-w-full"
      />

      {state === "busy" ? (
        <output className="pf-meta pf-muted">Uploading…</output>
      ) : null}

      {error ? <output className="pf-meta pf-strong">{error}</output> : null}
    </div>
  );
}

/**
 * A plain `<img>`: the source is whatever host the author pastes, and `next/image`
 * only serves the ones allowed in `next.config.ts`. A `storage:<id>` reference is
 * resolved through the preview map the draft carries.
 */
function Thumbnail({ token }: { token: string }) {
  const draft = useDraft();
  const src = token.startsWith("storage:") ? draft.previewFor(token) : token;

  return (
    <span className="pf-frame pf-thumb">
      {src ? (
        // biome-ignore lint/performance/noImgElement: an arbitrary, unoptimisable host
        <img src={src} alt="" className="size-full object-contain" />
      ) : null}
    </span>
  );
}
