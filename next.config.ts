import type { NextConfig } from "next";

// Uploaded images are served from the deployment itself, so the allowed host
// follows whichever deployment this build points at.
function convexImageHost() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return [];

  try {
    const { protocol, hostname, port } = new URL(url);
    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        ...(port ? { port } : {}),
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  reactCompiler: true,

  // The portfolio's content changes only when its author saves. Every read is
  // cached with `use cache` and a `portfolio:<section>` tag, and a save
  // revalidates just the tags it touched — see `_components/content.ts`.
  cacheComponents: true,

  images: {
    remotePatterns: [
      // Content carried over from the old site: portfolio assets on the Sanity
      // CDN, article covers on the Hashnode one.
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
      { protocol: "https", hostname: "cdn.hashnode.com", pathname: "/res/**" },
      // Favicons, for the tools a record has not been given an icon of its own.
      // The query carries the host being asked about, so it cannot be pinned; the
      // path can. It answers with a redirect to `gstatic.com`, which the optimiser
      // follows without needing a pattern of its own.
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons",
      },
      // Repository owners' avatars, which the Open source lookup fills in.
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      ...convexImageHost(),
    ],
  },
};

export default nextConfig;
