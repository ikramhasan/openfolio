"use client";

import { useId, useState } from "react";
import type { NewsletterCopy } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success" | "error";

export function Newsletter({
  copy,
  subscribe,
}: {
  copy: NewsletterCopy;
  subscribe: (email: string) => Promise<boolean>;
}) {
  const inputId = useId();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(value.trim())) {
      setStatus("error");
      setMessage(copy.messages.invalidEmail);
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const ok = await subscribe(value.trim());

      if (!ok) {
        setStatus("error");
        setMessage(copy.messages.error);
        return;
      }

      setStatus("success");
      setMessage(copy.messages.success);
      setValue("");
    } catch {
      setStatus("error");
      setMessage(copy.messages.error);
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="max-w-md">
      <label htmlFor={inputId} className="pf-body mt-1 block">
        {copy.inputLabel}
      </label>

      <form onSubmit={handleSubmit} noValidate className="mt-4">
        <div
          className="pf-field flex items-center gap-1 rounded-[10px] border p-1"
          data-invalid={status === "error" ? "true" : undefined}
        >
          <input
            id={inputId}
            type="email"
            name="email"
            autoComplete="email"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (status !== "idle") {
                setStatus("idle");
                setMessage(null);
              }
            }}
            placeholder={copy.placeholder}
            aria-invalid={status === "error"}
            aria-describedby={message ? `${inputId}-message` : undefined}
            className="pf-input min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-[0.875rem] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="pf-button shrink-0 rounded-[7px] px-3.5 py-1.5 text-[0.8125rem] font-medium disabled:opacity-60"
          >
            {isLoading ? copy.loadingLabel : copy.submitLabel}
          </button>
        </div>

        <output
          id={`${inputId}-message`}
          data-shown={Boolean(message)}
          className={`pf-status pf-meta block ${message ? "pf-strong mt-2.5" : ""}`}
        >
          {message}
        </output>
      </form>
    </div>
  );
}
