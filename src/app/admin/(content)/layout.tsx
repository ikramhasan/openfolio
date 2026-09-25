import Link from "next/link";
import { Rail } from "../../_components/rail";
import { SaveDock } from "../_components/save-dock";
import { SignOutButton } from "../_components/sign-out";
import { save } from "../_lib/actions";
import { DraftProvider } from "../_lib/draft";
import { load } from "../_lib/repository";
import { adminNavItems } from "../_lib/schema";

export const instant = false;

export default async function ContentLayout({
  children,
}: LayoutProps<"/admin">) {
  const { portfolio, storageUrls } = await load();

  return (
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
  );
}
