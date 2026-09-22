import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * The single gate in front of everything that reads drafts or writes content.
 *
 * The identity comes from the request's token via `getAuthUserId` — never from an
 * argument — and the `isAdmin` flag is re-read from the database on every call, so
 * revoking it takes effect immediately.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Not signed in.");

  const user = await ctx.db.get(userId as Id<"users">);
  if (!user || user.isAdmin !== true) throw new ConvexError("Not permitted.");

  return user;
}

/** Whether any account exists. Sign-up is refused once one does. */
export async function hasAnyUser(
  ctx: QueryCtx | MutationCtx,
): Promise<boolean> {
  return (await ctx.db.query("users").first()) !== null;
}
