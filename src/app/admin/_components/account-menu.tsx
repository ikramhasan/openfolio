"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignOut } from "./sign-out";

export function AccountMenu() {
  const { busy, signOut } = useSignOut();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label="Account"
        className="pf-theme-button inline-flex"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="currentColor"
        >
          <circle cx="3.5" cy="8" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="12.5" cy="8" r="1.2" />
        </svg>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-36 rounded-[10px] border-[var(--pf-rule)] p-1 shadow-sm"
      >
        <DropdownMenuItem asChild className="pf-meta px-2.5 py-2">
          <Link href="/" target="_blank" rel="noreferrer">
            View site
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={busy}
          onSelect={(event) => {
            event.preventDefault();
            signOut();
          }}
          className="pf-meta px-2.5 py-2"
        >
          {busy ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
