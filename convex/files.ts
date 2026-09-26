import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  internalMutation,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { requireAdmin } from "./lib/authz";
import { bodyStorageIds } from "./lib/body";
import { type ImageRef, storageIdsIn } from "./lib/images";
import { BODY_TABLES } from "./lib/writable";

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const url = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { storageId }) => {
    await requireAdmin(ctx);
    return ctx.storage.getUrl(storageId);
  },
});

const SWEEP_LIMIT = 2000;

export const collectGarbage = internalMutation({
  args: {},
  returns: v.object({ deleted: v.number() }),
  handler: async (ctx) => {
    const referenced = await referencedStorageIds(ctx);
    const files = await ctx.db.system.query("_storage").take(SWEEP_LIMIT);

    const cutoff = Date.now() - 60 * 60 * 1000;
    let deleted = 0;

    for (const file of files) {
      if (referenced.has(file._id)) continue;
      if (file._creationTime > cutoff) continue;

      await ctx.storage.delete(file._id);
      deleted += 1;
    }

    return { deleted };
  },
});

async function referencedStorageIds(
  ctx: QueryCtx | MutationCtx,
): Promise<Set<Id<"_storage">>> {
  const refs: (ImageRef | undefined)[] = [];
  const ids: Id<"_storage">[] = [];

  const intro = await ctx.db.query("intro").first();
  refs.push(intro?.profileImage);
  refs.push(intro?.resume);

  for (const row of await ctx.db.query("photos").collect()) {
    refs.push(row.image);
  }
  for (const row of await ctx.db.query("education").collect()) {
    refs.push(row.logo);
  }
  for (const row of await ctx.db.query("experience").collect()) {
    refs.push(row.logo);
  }
  for (const row of await ctx.db.query("youtubeVideos").collect()) {
    refs.push(row.thumbnail);
  }
  for (const row of await ctx.db.query("articles").collect()) {
    refs.push(row.coverImage);
  }
  for (const row of await ctx.db.query("projects").collect()) {
    refs.push(row.logo);
  }
  for (const row of await ctx.db.query("tools").collect()) {
    refs.push(row.icon);
  }
  for (const row of await ctx.db.query("openSource").collect()) {
    refs.push(row.avatar);
  }
  for (const row of await ctx.db.query("awards").collect()) {
    refs.push(row.logo);
  }
  for (const row of await ctx.db.query("recommendations").collect()) {
    refs.push(row.author.image);
  }

  for (const table of Object.values(BODY_TABLES)) {
    for (const row of await ctx.db.query(table).collect()) {
      ids.push(...bodyStorageIds(row.value));
    }
  }

  const aboutBio = await ctx.db.query("aboutBio").first();
  if (aboutBio) ids.push(...bodyStorageIds(aboutBio.value));

  return new Set([...storageIdsIn(refs), ...ids]);
}
