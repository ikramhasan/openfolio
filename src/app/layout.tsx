import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { portfolio, sections } from "./_components/data";
import { Footer } from "./_components/footer";
import { Masthead } from "./_components/masthead";
import { Rail } from "./_components/rail";
import { navItems } from "./_components/sections";
import "./globals.css";

// Inter's alternate glyphs (`cv05`, `cv08`, `ss03`) are enabled in `globals.css`.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${sections.intro.title}`,
    default: portfolio.site.title,
  },
  description: portfolio.site.description,
};

/**
 * The persistent shell: index rail beside one section's route. Everything that
 * survives a section change lives here, so navigating re-renders only the panel.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Has to run before the first paint, or a pinned theme flashes the system
            ramp. The key mirrors `THEME_STORAGE_KEY` in `theme-toggle.tsx`. */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: a static literal, and it has to run before paint
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("pf-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
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
      </body>
    </html>
  );
}
