import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * The auth provider is mounted here and under `/admin` only. The public site never
 * reads a cookie, which is what lets it prerender.
 */
export default function SignInLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>{children}</ConvexAuthNextjsServerProvider>
  );
}
