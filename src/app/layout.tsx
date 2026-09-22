import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getIntro, getSite } from "./_components/content";
import { siteUrl } from "./_components/site-url";
import "./globals.css";

// Inter's alternate glyphs (`cv05`, `cv08`, `ss03`) are enabled in `globals.css`.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Absolute URLs for canonical links and social cards. Set `NEXT_PUBLIC_SITE_URL`
 * on the host; the localhost fallback only matters in development, where nothing
 * consumes them.
 */

export async function generateMetadata(): Promise<Metadata> {
  const [site, intro] = await Promise.all([getSite(), getIntro()]);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: `%s | ${intro.title}`,
      default: site.title,
    },
    description: site.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "profile",
      siteName: site.title,
      title: site.title,
      description: site.description,
      url: "/",
      ...(intro.profileImage ? { images: [intro.profileImage] } : {}),
    },
    twitter: {
      card: "summary",
      title: site.title,
      description: site.description,
    },
  };
}

/**
 * The document shell. The portfolio's own chrome — rail, masthead, footer — lives
 * in `(site)/layout.tsx`, so `/admin` and `/signin` can supply their own without
 * inheriting it.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The theme script below sets `data-theme` before React arrives, which
      // React would otherwise report as a mismatched attribute.
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
