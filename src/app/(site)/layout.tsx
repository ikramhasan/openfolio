import { cacheLife, cacheTag } from "next/cache";
import { tagFor } from "../_components/content";
import { Footer } from "../_components/footer";
import { Identity } from "../_components/identity";
import { Rail } from "../_components/rail";
import { navItems } from "../_components/sections";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("nav"), tagFor("intro"), tagFor("footer"), tagFor("connect"));

  const items = await navItems();

  return (
    <div
      id="top"
      className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] gap-x-16 px-6 sm:px-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:grid-rows-[1fr]"
    >
      <Rail items={items} identity={<Identity />} admin />

      <div className="flex min-w-0 flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
