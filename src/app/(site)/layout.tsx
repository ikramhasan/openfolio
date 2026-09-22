import { Footer } from "../_components/footer";
import { Masthead } from "../_components/masthead";
import { Rail } from "../_components/rail";
import { navItems } from "../_components/sections";

/**
 * The persistent shell: index rail beside one section's route. Everything that
 * survives a section change lives here, so navigating re-renders only the panel.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div
      id="top"
      className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-[minmax(0,1fr)] gap-x-16 px-6 sm:px-10 lg:grid-cols-[200px_minmax(0,1fr)]"
    >
      <Rail items={navItems} />

      <div className="min-w-0">
        <Masthead />
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
