import {
  ConvexAuthNextjsServerProvider,
  isAuthenticatedNextjs,
} from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Rail } from "../_components/rail";
import { SaveDock } from "./_components/save-dock";
import { SignOutButton } from "./_components/sign-out";
import { save } from "./_lib/actions";
import { DraftProvider } from "./_lib/draft";
import { load } from "./_lib/repository";
import { adminNavItems } from "./_lib/schema";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  // Editing surface, not content.
  robots: { index: false, follow: false },
};

/**
 * Nothing under `/admin` is worth a static shell: every byte of it is behind the
 * session, so the route blocks on that read rather than streaming a skeleton first.
 */
export const instant = false;

/**
 * The draft lives in the layout rather than the page, so switching groups keeps the
 * unsaved work.
 *
 * Three checks stand in front of it and none of them is the one that matters:
 * `proxy.ts` turns an unauthenticated request away before this renders, the
 * redirect below catches what the proxy's matcher missed, and the real refusal is
 * inside Convex, where `load` and `save` both begin with `requireAdmin`. A signed-in
 * visitor who is somehow not the admin gets an empty editor and a failed save, not
 * someone else's content.
 *
 * This subtree is also the only place the auth provider is mounted. Mounting it in
 * the root layout would make it read cookies for every request and cost the public
 * site its prerender.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!(await isAuthenticatedNextjs())) redirect("/signin?next=/admin");

  const { portfolio, storageUrls } = await load();

  return (
    <ConvexAuthNextjsServerProvider>
      <DraftProvider initial={portfolio} storageUrls={storageUrls} save={save}>
        <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-[minmax(0,1fr)] gap-x-16 px-6 pb-28 sm:px-10 lg:grid-cols-[200px_minmax(0,1fr)]">
          <Rail items={adminNavItems} label="Admin groups" />

          <div className="min-w-0">
            <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-8 pb-10 lg:pt-14">
              <div>
                <h1 className="pf-section-title">Content</h1>
                <p className="pf-meta mt-1">
                  Everything the portfolio reads. Saving publishes it.
                </p>
              </div>

              <div className="flex shrink-0 items-baseline gap-5">
                <Link
                  href="/"
                  // A new tab: leaving the editor would discard the draft.
                  target="_blank"
                  rel="noreferrer"
                  className="pf-link-quiet pf-meta"
                >
                  View site ↗
                </Link>

                <SignOutButton />
              </div>
            </header>

            <main>{children}</main>
          </div>
        </div>

        <SaveDock />
      </DraftProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
