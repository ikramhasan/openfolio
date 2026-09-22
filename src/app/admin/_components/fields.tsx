"use client";

import { useId } from "react";
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
        {field.kind === "image" ? <Thumbnail src={text} /> : null}

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

      {field.hint ? (
        <p id={describedBy} className="pf-meta pf-faint mt-1.5">
          {field.hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A plain `<img>`: the source is whatever host the author pastes, and
 * `next/image` only serves the ones allowed in `next.config.ts`.
 */
function Thumbnail({ src }: { src: string }) {
  return (
    <span className="pf-frame pf-thumb">
      {src ? (
        // biome-ignore lint/performance/noImgElement: an arbitrary, unoptimisable host
        <img src={src} alt="" className="size-full object-contain" />
      ) : null}
    </span>
  );
}
