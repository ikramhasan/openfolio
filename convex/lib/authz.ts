import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Not signed in.");

  const user = await ctx.db.get(userId as Id<"users">);
  if (!user || user.isAdmin !== true) throw new ConvexError("Not permitted.");

  return user;
}

export async function hasAnyUser(
  ctx: QueryCtx | MutationCtx,
): Promise<boolean> {
  return (await ctx.db.query("users").first()) !== null;
}
