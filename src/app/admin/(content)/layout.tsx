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
        <Rail
          items={adminNavItems}
          label="Admin groups"
          actions={
            <>
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className="pf-admin pf-admin-enter"
              >
                View site
                <span aria-hidden="true" className="pf-admin-arrow">
                  ↗
                </span>
              </Link>

              <SignOutButton />
            </>
          }
        />

        <div className="min-w-0">
          <main>{children}</main>
        </div>
      </div>

      <SaveDock />
    </DraftProvider>
  );
}
