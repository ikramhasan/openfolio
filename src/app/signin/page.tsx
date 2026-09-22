import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { connection } from "next/server";
import { SignInForm } from "./form";

/**
 * The one way in. Sign-up is offered only while the single account is unclaimed;
 * after that the form has a sign-in tab and nothing else.
 *
 * This page only decides what to render. Whether a sign-up is allowed is decided in
 * `convex/auth.ts`, which refuses once a user exists and, if `ADMIN_EMAIL` is set,
 * refuses every address but that one.
 */

// Deliberately per-request: a prerendered "sign-up is open" would offer a form the
// backend then refuses, and vice versa. `connection()` is what says so.
export const instant = false;

export default async function SignInPage() {
  await connection();
  const open = await fetchQuery(api.users.signUpOpen, {});

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="pf-section-title">
        {open ? "Claim the account" : "Sign in"}
      </h1>

      <p className="pf-meta mt-1">
        {open
          ? "No account exists yet. The first one made is the only one there will be."
          : "The editor is behind this."}
      </p>

      <SignInForm allowSignUp={open} />
    </main>
  );
}
