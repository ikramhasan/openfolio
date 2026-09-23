"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";

const RULE = "At least 12 characters, with upper case, lower case and a digit.";

function readable(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const match = raw.match(/Uncaught ConvexError:\s*([^\n]*)/);

  if (match) return match[1].trim();

  return "Could not sign in. Check the address and password.";
}

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//"))
    return "/admin";
  return value;
}

export function SignInForm({ allowSignUp }: { allowSignUp: boolean }) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const params = useSearchParams();

  const emailId = useId();
  const passwordId = useId();

  const [flow, setFlow] = useState<"signIn" | "signUp">(
    allowSignUp ? "signUp" : "signIn",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);

    try {
      await signIn("password", {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        flow,
      });

      router.replace(safeNext(params.get("next")));
    } catch (thrown) {
      setError(readable(thrown));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor={emailId} className="pf-column block">
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="username"
          required
          className="pf-input pf-rule mt-1.5 w-full rounded-md border bg-transparent px-3 py-2 text-[0.875rem] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor={passwordId} className="pf-column block">
          Password
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete={flow === "signUp" ? "new-password" : "current-password"}
          required
          minLength={flow === "signUp" ? 12 : undefined}
          className="pf-input pf-rule mt-1.5 w-full rounded-md border bg-transparent px-3 py-2 text-[0.875rem] focus:outline-none"
        />
        {flow === "signUp" ? (
          <p className="pf-meta pf-faint mt-1.5">{RULE}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="pf-button w-full rounded-md px-4 py-2 text-[0.8125rem] font-medium disabled:opacity-60"
      >
        {busy
          ? "Working…"
          : flow === "signUp"
            ? "Create the account"
            : "Sign in"}
      </button>

      {allowSignUp ? (
        <button
          type="button"
          onClick={() => {
            setFlow(flow === "signUp" ? "signIn" : "signUp");
            setError(null);
          }}
          className="pf-link-quiet pf-meta"
        >
          {flow === "signUp"
            ? "I already have the account"
            : "Create the account instead"}
        </button>
      ) : null}

      <output
        aria-live="polite"
        className={`pf-meta block ${error ? "pf-strong" : ""}`}
      >
        {error}
      </output>
    </form>
  );
}
