/**
 * The site's own origin, for canonical links, social cards and the sitemap.
 *
 * These are baked into the prerendered HTML, so the variable has to be set for the
 * build, not just for the running server — a build without it ships canonicals
 * pointing at localhost.
 */

const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

if (!configured && process.env.NODE_ENV === "production") {
  console.warn(
    "NEXT_PUBLIC_SITE_URL is not set. Canonical links, OpenGraph URLs and the sitemap will point at http://localhost:3000.",
  );
}

export const siteUrl = configured ?? "http://localhost:3000";
