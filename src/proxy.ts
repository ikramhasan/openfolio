import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

/**
 * Two jobs, both from Convex Auth: `/api/auth` is proxied to the deployment so the
 * session cookies are set httpOnly by this origin rather than held in JavaScript,
 * and `/admin` is refused before it renders.
 *
 * This is the outer gate, not the only one. It runs on the edge of the request and
 * can only see whether a token is present and valid; whether that token belongs to
 * the admin is checked in Convex, inside every function that reads or writes
 * content. Deleting this file would cost a redirect, not the authorisation.
 *
 * (`middleware.ts` in Next 15 and earlier. The file is the same middleware under
 * its new name.)
 */

const isEditor = createRouteMatcher(["/admin(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (!isEditor(request)) return;
  if (await convexAuth.isAuthenticated()) return;

  const next = encodeURIComponent(
    request.nextUrl.pathname + request.nextUrl.search,
  );

  return nextjsMiddlewareRedirect(request, `/signin?next=${next}`);
});

export const config = {
  // Only the routes that have anything to do with a session. The public pages are
  // prerendered and never read a cookie, so running this for them would add a
  // token refresh to every visit and buy nothing.
  matcher: [
    "/admin",
    "/admin/:path*",
    "/signin",
    "/api/auth",
    "/api/auth/:path*",
  ],
};
