import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isEditor = createRouteMatcher(["/admin(.*)"]);
const isEditorApi = createRouteMatcher(["/api/ai(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const editor = isEditor(request);
  if (!editor && !isEditorApi(request)) return;
  if (await convexAuth.isAuthenticated()) return;

  if (!editor) {
    return new Response(JSON.stringify({ error: "Not signed in." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const next = encodeURIComponent(
    request.nextUrl.pathname + request.nextUrl.search,
  );

  return nextjsMiddlewareRedirect(request, `/signin?next=${next}`);
});

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/signin",
    "/api/auth",
    "/api/auth/:path*",
    "/api/ai/:path*",
  ],
};
