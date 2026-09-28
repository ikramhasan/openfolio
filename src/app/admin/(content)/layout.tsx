import Link from "next/link";
import { Identity } from "../../_components/identity";
import { Rail } from "../../_components/rail";
import { AccountMenu } from "../_components/account-menu";
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
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] gap-x-16 px-6 pb-28 sm:px-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:grid-rows-[1fr]">
        <Rail
          items={adminNavItems}
          label="Admin groups"
          identity={<Identity />}
          plain
          actions={
            <>
              <div className="hidden lg:contents">
                <Link
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="pf-link-quiet pf-meta"
                >
                  View site
                </Link>

                <SignOutButton />
              </div>

              <div className="contents lg:hidden">
                <AccountMenu />
              </div>
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
