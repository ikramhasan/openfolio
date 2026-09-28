"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useSignOut() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    await signOut();
    router.replace("/signin");
  }

  return { busy, signOut: run };
}

export function SignOutButton() {
  const { busy, signOut } = useSignOut();

  return (
    <button
      type="button"
      disabled={busy}
      onClick={signOut}
      className="pf-link-quiet pf-meta cursor-pointer disabled:opacity-60"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
