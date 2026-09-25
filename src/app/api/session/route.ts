import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";

export async function GET(): Promise<Response> {
  const admin = await isAuthenticatedNextjs();

  return Response.json(
    { admin },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
