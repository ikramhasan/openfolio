import {
  ConvexAuthNextjsServerProvider,
  isAuthenticatedNextjs,
} from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  // Editing surface, not content.
  robots: { index: false, follow: false },
};

/**
 * Nothing under `/admin` is worth a static shell: every byte of it is behind the
 * session, so the route blocks on that read rather than streaming a skeleton first.
 */
export const instant = false;

/**
 * The gate, and nothing else. What the editor looks like is one level down, because
 * there are two kinds of page under here and they do not share their furniture: the
 * content groups wear the portfolio's rail and hold a draft of the whole document
 * (`(content)/layout.tsx`), while writing a post wants the window.
 *
 * Three checks stand in front of both and none of them is the one that matters:
 * `proxy.ts` turns an unauthenticated request away before this renders, the redirect
 * below catches what the proxy's matcher missed, and the real refusal is inside
 * Convex, where every read and write begins with `requireAdmin`. A signed-in visitor
 * who is somehow not the admin gets an empty editor and a failed save, not someone
 * else's content.
 *
 * This subtree is also the only place the auth provider is mounted. Mounting it in
 * the root layout would make it read cookies for every request and cost the public
 * site its prerender.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!(await isAuthenticatedNextjs())) redirect("/signin?next=/admin");

  return (
    <ConvexAuthNextjsServerProvider>{children}</ConvexAuthNextjsServerProvider>
  );
}
