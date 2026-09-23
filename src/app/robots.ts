import type { MetadataRoute } from "next";
import { siteUrl } from "./_components/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/signin", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
