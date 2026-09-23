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

/**
 * Uploads and the sweep that follows them.
 *
 * Convex mints a single-use upload URL rather than accepting the bytes through a
 * function, so the gate is here: only the admin can get one. Serving is public —
 * these are the portfolio's own photographs — but writing is not.
 */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

/**
 * Where a freshly uploaded file can be read from. Only the editor needs it — the
 * site's URLs are minted inside the queries that return the content — so it is
 * behind the same gate as the upload itself.
 */
export const url = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { storageId }) => {
    await requireAdmin(ctx);
    return ctx.storage.getUrl(storageId);
  },
});

/** How many files one sweep considers. A portfolio's image count is in the tens. */
const SWEEP_LIMIT = 2000;

/**
 * Deletes stored files no row points at any more.
 *
 * Scheduled by `admin.save`, because replacing a photograph leaves the old one
 * uploaded and unreferenced, and nothing else would ever remove it. Files younger
 * than the grace period are spared: an upload that has not been saved yet is not
 * garbage.
 */
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

/**
 * Every storage id reachable from content. Add a table with an image column and it
 * has to be added here, or the sweep will delete its files.
 */
async function referencedStorageIds(
  ctx: QueryCtx | MutationCtx,
): Promise<Set<Id<"_storage">>> {
  const refs: (ImageRef | undefined)[] = [];
  const ids: Id<"_storage">[] = [];

  const intro = await ctx.db.query("intro").first();
  refs.push(intro?.profileImage);

  const footer = await ctx.db.query("footer").first();
  refs.push(footer?.signature.image);

  for (const row of await ctx.db.query("headingImages").collect()) {
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
  for (const row of await ctx.db.query("awards").collect()) {
    refs.push(row.logo);
  }
  for (const row of await ctx.db.query("recommendations").collect()) {
    refs.push(row.author.image);
  }

  // Images inside an article body, which are tokens in the stored JSON.
  for (const row of await ctx.db.query("articleBodies").collect()) {
    ids.push(...bodyStorageIds(row.value));
  }

  return new Set([...storageIdsIn(refs), ...ids]);
}
