import { cacheLife, cacheTag } from "next/cache";
import { tagFor } from "../_components/content";
import { Footer } from "../_components/footer";
import { Masthead } from "../_components/masthead";
import { Rail } from "../_components/rail";
import { navItems } from "../_components/sections";

/**
 * The persistent shell: index rail beside one section's route. Everything that
 * survives a section change lives here, so navigating re-renders only the panel.
 *
 * Cached as its own entry, tagged with every section it reads — the rail's order
 * and wording (`nav`), the masthead (`intro`), and the footer with its newsletter
 * copy. A section edited outside that set leaves this shell untouched.
 */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  "use cache";
  cacheLife("max");
  cacheTag(tagFor("nav"), tagFor("intro"), tagFor("footer"), tagFor("connect"));

  const items = await navItems();

  return (
    <div
      id="top"
      className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-[minmax(0,1fr)] gap-x-16 px-6 sm:px-10 lg:grid-cols-[200px_minmax(0,1fr)]"
    >
      <Rail items={items} />

      <div className="min-w-0">
        <Masthead />
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
