const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

if (!configured && process.env.NODE_ENV === "production") {
  console.warn(
    "NEXT_PUBLIC_SITE_URL is not set. Canonical links, OpenGraph URLs and the sitemap will point at http://localhost:3000.",
  );
}

export const siteUrl = configured ?? "http://localhost:3000";
