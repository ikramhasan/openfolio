import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { connection } from "next/server";
import { SignInForm } from "./form";

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
