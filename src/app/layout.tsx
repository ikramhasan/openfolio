import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { portfolio, sections } from "./_components/data";
import { Footer } from "./_components/footer";
import { Masthead } from "./_components/masthead";
import { Rail } from "./_components/rail";
import { navItems } from "./_components/sections";
import "./globals.css";

/**
 * One neutral grotesque for the whole site. Inter's alternate glyphs are enabled
 * in `globals.css` (`cv05`, `cv08`, `ss03`) to soften the default l/I/i shapes,
 * which matters at the small sizes this layout leans on.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    /* Section pages set only their own name; the site title completes it. */
    template: `%s | ${sections.intro.title}`,
    default: portfolio.site.title,
  },
  description: portfolio.site.description,
};

/**
 * The persistent shell: the index rail on the left, one section's route on the
 * right.
 *
 * Everything that survives a section change lives here rather than in the pages,
 * so navigating re-renders only the panel. The rail keeps its scroll position and
 * the masthead is never re-requested.
 *
 * The persistent header is only the portrait, name and bio. Everything that reads
 * as content — the current role, the links, the photo strip, the skills table —
 * lives in the About panel, so a section page shows that section rather than a
 * header taller than its content.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <div
          id="top"
          className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-[minmax(0,1fr)] gap-x-16 px-6 sm:px-10 lg:grid-cols-[200px_minmax(0,1fr)]"
        >
          {/*
            The rail is the only way to reach a section, so it is never hidden
            behind a menu button. It is a sticky vertical index from `lg` and a
            sticky horizontal strip below that — see `_components/rail.tsx`.
          */}
          <Rail items={navItems} name={sections.intro.title} />

          <div className="min-w-0">
            <Masthead />
            <main>{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
