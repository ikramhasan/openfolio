"use client";

import { useId, useState } from "react";
import { sections } from "./data";

const newsletter = sections.connect.newsletter;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success" | "error";

/**
 * The newsletter sign-up, in the footer.
 *
 * This was the Contact section's panel. It sits in the footer now, so it is on
 * every page rather than behind a rail entry of its own — a single form did not
 * earn a section beside Experience and Projects.
 *
 * The "or reach me directly" line that used to close it is gone: the footer's own
 * link row sits immediately below and already carries Email and Book a meeting,
 * from the same source data.
 *
 * NOTE: this project has no backend, so `subscribe` resolves locally. Point it
 * at a real endpoint (e.g. `POST /api/newsletter`) when one exists; the error
 * branch and its copy are already wired for a failing request.
 */
async function subscribe(_email: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export function Newsletter() {
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

          It takes no room until there is something to say. It used to reserve a
          line's height permanently so the links below would not move when a
          message arrived — but that spent 30px of blank space on every page view
          to avoid a shift that only happens on submit, and left the footer visibly
          bottom-heavy: 37px above the form, 66px below it. The message is the
          reader's own doing, so the small reflow is expected.
        */}
        <output
          id={`${inputId}-message`}
          className={`pf-meta block ${message ? "pf-strong mt-2.5" : ""}`}
        >
          {message}
        </output>
      </form>
    </div>
  );
}
