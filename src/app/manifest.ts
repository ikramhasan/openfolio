import type { MetadataRoute } from "next";
import { getIntro, getSite } from "./_components/content";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [site, intro] = await Promise.all([getSite(), getIntro()]);

  return {
    name: site.title,
    short_name: intro.title,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
      {
        src: "/icon/maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
