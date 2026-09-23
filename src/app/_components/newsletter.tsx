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
    <div className="max-w-lg">
      <label htmlFor={inputId} className="pf-body block">
        {copy.inputLabel}
      </label>

      <form onSubmit={handleSubmit} noValidate className="mt-3.5">
        <div className="flex flex-col gap-2 sm:flex-row">
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
            className="pf-input pf-rule min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2 text-[0.875rem] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="pf-button shrink-0 rounded-md px-4 py-2 text-[0.8125rem] font-medium disabled:opacity-60"
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
