import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { portfolio } from "./_components/data";
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
  title: portfolio.site.title,
  description: portfolio.site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
