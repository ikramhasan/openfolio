"use client";

import { useId, useRef, useState } from "react";
import { faviconUrl, formatCount } from "../../_components/data";
import { createUploadUrl, lookupContribution } from "../_lib/actions";
import { useDraft } from "../_lib/draft";
import type { Field, FieldKind } from "../_lib/schema";
import { SquareCrop } from "./square-crop";

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

function tidy(kind: FieldKind, value: unknown): unknown {
  if (kind !== "tags" && kind !== "lines") return value;
  if (!Array.isArray(value)) return value;

  const next = value.map((entry) => String(entry).trim()).filter(Boolean);
  const same =
    next.length === value.length &&
    next.every((entry, index) => entry === value[index]);

  return same ? value : next;
}

export function FieldInput({
  path,
  field,
  suggestions,
}: {
  path: string;
  field: Field;
  suggestions?: string[];
}) {
  const draft = useDraft();
  const id = useId();

  const value = draft.read(path);
  const text = toInput(field.kind, value);
  const describedBy = field.hint ? `${id}-hint` : undefined;
  const listId =
    field.suggest && suggestions && suggestions.length > 0
      ? `${id}-options`
      : undefined;

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
      <div className="flex items-baseline justify-between gap-x-4">
        <label htmlFor={id} className="pf-column">
          {field.label}
        </label>

        {field.kind === "image" && field.from ? (
          <SiteIcon path={path} source={siblingPath(path, field)} />
        ) : null}
      </div>

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
            list={listId}
            inputMode={field.kind === "number" ? "numeric" : undefined}
            aria-describedby={describedBy}
            onChange={(event) => commit(event.target.value)}
            onBlur={() => {
              draft.setField(path, tidy(field.kind, value));

              if (field.kind === "image" && field.probeSize) {
                probeExternalSize(draft, text, recordBase(path, field));
              }
            }}
            className="pf-field pf-input min-w-0 flex-1"
          />
        )}
      </div>

      {listId ? (
        <datalist id={listId}>
          {suggestions?.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      ) : null}

      {field.kind === "image" ? (
        <Upload
          path={path}
          label={field.label}
          square={field.square}
          sizeBase={field.probeSize ? recordBase(path, field) : undefined}
        />
      ) : null}

      {field.kind === "file" ? (
        <Upload path={path} label={field.label} accept={field.accept} />
      ) : null}

      {field.fill === "github" ? (
        <GitHubFill path={path} base={recordBase(path, field)} />
      ) : null}

      {field.hint ? (
        <p id={describedBy} className="pf-meta pf-faint mt-1.5">
          {field.hint}
        </p>
      ) : null}
    </div>
  );
}

function siblingPath(path: string, field: Field): string {
  return `${recordBase(path, field)}${field.from}`;
}

function recordBase(path: string, field: Field): string {
  return path.slice(0, path.length - field.key.length);
}

function probeExternalSize(
  draft: ReturnType<typeof useDraft>,
  url: string,
  base: string,
): void {
  const trimmed = url.trim();
  if (trimmed === "" || trimmed.startsWith("storage:")) return;

  const image = new window.Image();

  image.onload = () => {
    draft.setField(`${base}width`, image.naturalWidth);
    draft.setField(`${base}height`, image.naturalHeight);
  };

  image.src = trimmed;
}

function GitHubFill({ path, base }: { path: string; base: string }) {
  const draft = useDraft();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url = String(draft.read(path) ?? "").trim();
  const read = (key: string) => draft.read(`${base}${key}`);

  const repo = String(read("repo") ?? "");
  const number = Number(read("number") ?? 0);
  const stars = Number(read("stars") ?? 0);

  const snapshot = [
    number > 0 ? `${repo} #${number}` : repo,
    String(read("state") ?? ""),
    stars > 0 ? `${formatCount(stars)} stars` : "",
    String(read("date") ?? ""),
  ]
    .filter(Boolean)
    .join(" · ");

  async function fill() {
    setError(null);
    setBusy(true);

    const result = await lookupContribution(url);

    if (result.ok) {
      for (const [key, value] of Object.entries(result.record)) {
        draft.setField(`${base}${key}`, value);
      }
    } else {
      setError(result.error);
    }

    setBusy(false);
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <button
        type="button"
        disabled={url === "" || busy}
        onClick={() => void fill()}
        className="pf-button-quiet disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Fetching…" : snapshot ? "Fetch again" : "Fetch from GitHub"}
      </button>

      {error ? (
        <output className="pf-meta pf-strong">{error}</output>
      ) : snapshot ? (
        <output className="pf-meta pf-faint min-w-0">{snapshot}</output>
      ) : null}
    </div>
  );
}

function SiteIcon({ path, source }: { path: string; source: string }) {
  const draft = useDraft();
  const icon = faviconUrl(String(draft.read(source) ?? ""));

  return (
    <button
      type="button"
      disabled={icon === ""}
      onClick={() => draft.setField(path, icon)}
      className={
        icon === ""
          ? "pf-meta pf-faint shrink-0 cursor-not-allowed"
          : "pf-link-quiet pf-meta shrink-0"
      }
    >
      Use site icon
    </button>
  );
}

const MAX_BYTES = 8 * 1024 * 1024;

function Upload({
  path,
  label,
  sizeBase,
  square,
  accept: mime,
}: {
  path: string;
  label: string;
  sizeBase?: string;
  square?: boolean;
  accept?: string;
}) {
  const draft = useDraft();
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "busy">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<File | null>(null);

  function clearInput() {
    if (input.current) input.current.value = "";
  }

  function accept(file: File) {
    setError(null);

    if (mime ? file.type !== mime : !file.type.startsWith("image/")) {
      setError(
        mime === "application/pdf"
          ? "That is not a PDF."
          : "That is not an image.",
      );
      clearInput();
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("Too large — 8 MB is the limit.");
      clearInput();
      return;
    }

    if (square) {
      setPending(file);
      return;
    }

    void upload(file);
  }

  async function upload(file: File) {
    setError(null);
    setState("busy");

    try {
      const [target, dimensions] = await Promise.all([
        createUploadUrl(),
        sizeBase ? readImageSize(file) : Promise.resolve(undefined),
      ]);
      if (!target) throw new Error("no upload url");

      const response = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) throw new Error(`upload failed: ${response.status}`);

      const { storageId } = (await response.json()) as { storageId: string };
      const token = `storage:${storageId}`;

      draft.registerUpload(token, URL.createObjectURL(file));
      draft.setField(path, token);

      if (sizeBase && dimensions) {
        draft.setField(`${sizeBase}width`, dimensions.width);
        draft.setField(`${sizeBase}height`, dimensions.height);
      }
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setState("idle");
      clearInput();
    }
  }

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
      <input
        ref={input}
        type="file"
        accept={mime ?? "image/*"}
        aria-label={`Upload ${label.toLowerCase()}`}
        disabled={state === "busy"}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) accept(file);
        }}
        className="pf-meta pf-faint min-w-0 max-w-full"
      />

      {state === "busy" ? (
        <output className="pf-meta pf-muted">Uploading…</output>
      ) : null}

      {error ? <output className="pf-meta pf-strong">{error}</output> : null}

      {pending ? (
        <SquareCrop
          file={pending}
          onCancel={() => {
            setPending(null);
            clearInput();
          }}
          onConfirm={(cropped) => {
            setPending(null);
            void upload(cropped);
          }}
        />
      ) : null}
    </div>
  );
}

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

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("could not read image dimensions"));
    };

    image.src = url;
  });
}
