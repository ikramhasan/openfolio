"use client";

import { useId, useState } from "react";
import { bookingUrl, sections, socialLinks } from "./data";

const newsletter = sections.connect.newsletter;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success" | "error";

/**
 * NOTE: this project has no backend, so `subscribe` resolves locally. Point it
 * at a real endpoint (e.g. `POST /api/newsletter`) when one exists; the error
 * branch and its copy are already wired for a failing request.
 */
async function subscribe(_email: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

const email = socialLinks.find((link) => link.site === "email");

export function Connect() {
  const inputId = useId();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(value.trim())) {
      setStatus("error");
      setMessage(newsletter.messages.invalidEmail);
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      await subscribe(value.trim());
      setStatus("success");
      setMessage(newsletter.messages.success);
      setValue("");
    } catch {
      setStatus("error");
      setMessage(newsletter.messages.error);
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="max-w-lg">
      <label htmlFor={inputId} className="pf-body block">
        {newsletter.inputLabel}
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
            placeholder={newsletter.placeholder}
            aria-invalid={status === "error"}
            aria-describedby={message ? `${inputId}-message` : undefined}
            className="pf-input pf-rule min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2 text-[0.875rem] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="pf-button shrink-0 rounded-md px-4 py-2 text-[0.8125rem] font-medium disabled:opacity-60"
          >
            {isLoading ? newsletter.loadingLabel : newsletter.submitLabel}
          </button>
        </div>

        {/*
          With no accent colour available, the error state is carried by the
          copy and `aria-invalid` rather than by a red tint. Success reads in
          full-strength ink.
        */}
        <output
          id={`${inputId}-message`}
          className={`pf-meta mt-2.5 block min-h-[1.25rem] ${
            status === "idle" ? "" : "pf-strong"
          }`}
        >
          {message}
        </output>
      </form>

      {email || bookingUrl ? (
        <p className="pf-body mt-5">
          Or reach me directly
          {email ? (
            <>
              {" at "}
              <a href={email.url} className="pf-link pf-strong">
                {email.url.replace("mailto:", "")}
              </a>
            </>
          ) : null}
          {bookingUrl ? (
            <>
              {email ? ", or " : " — "}
              <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="pf-link pf-strong"
              >
                book a meeting
              </a>
            </>
          ) : null}
          .
        </p>
      ) : null}
    </div>
  );
}
