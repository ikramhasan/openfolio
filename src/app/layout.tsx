import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getIntro, getSite } from "./_components/content";
import { siteUrl } from "./_components/site-url";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

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
