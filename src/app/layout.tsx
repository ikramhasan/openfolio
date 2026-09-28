import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { FEED_PATH, identity } from "./_components/seo";
import { siteUrl } from "./_components/site-url";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
  colorScheme: "light dark",
};

export async function generateMetadata(): Promise<Metadata> {
  const { site, name, twitter } = await identity();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: `%s | ${name}`,
      default: site.title,
    },
    description: site.description,
    applicationName: site.title,
    authors: [{ name, url: siteUrl }],
    creator: name,
    publisher: name,
    alternates: {
      types: {
        "application/rss+xml": [{ url: FEED_PATH, title: site.title }],
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: site.title,
      title: site.title,
      description: site.description,
    },
    twitter: {
      card: "summary_large_image",
      ...(twitter ? { creator: twitter, site: twitter } : {}),
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
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
