import type { Metadata } from "next";
import Link from "next/link";
import { Rail } from "../_components/rail";
import { SaveDock } from "./_components/save-dock";
import { DraftProvider } from "./_lib/draft";
import { repository } from "./_lib/repository";
import { adminNavItems } from "./_lib/schema";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  // Editing surface, not content.
  robots: { index: false, follow: false },
};

/**
 * The draft lives in the layout rather than the page, so switching groups keeps
 * the unsaved work.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const initial = await repository.load();

  return (
    <DraftProvider initial={initial}>
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-[minmax(0,1fr)] gap-x-16 px-6 pb-28 sm:px-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        <Rail items={adminNavItems} label="Admin groups" />

        <div className="min-w-0">
          <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-8 pb-10 lg:pt-14">
            <div>
              <h1 className="pf-section-title">Content</h1>
              <p className="pf-meta mt-1">
                Everything the portfolio reads from{" "}
                <code>data/portfolio.json</code>.
              </p>
            </div>

            <Link
              href="/"
              // A new tab: leaving the editor would discard the draft.
              target="_blank"
              rel="noreferrer"
              className="pf-link-quiet pf-meta shrink-0"
            >
              View site ↗
            </Link>
          </header>

          <main>{children}</main>
        </div>
      </div>

      <SaveDock />
    </DraftProvider>
  );
}
