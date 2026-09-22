import type { MetadataRoute } from "next";
import { siteUrl } from "./_components/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The editor and the sign-in page carry no content worth indexing, and the
      // auth proxy is not a page at all.
      disallow: ["/admin", "/signin", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
