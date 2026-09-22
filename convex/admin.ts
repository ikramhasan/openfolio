import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/authz";
import * as project from "./lib/project";
import { type CacheKey, SECTION_KEYS, wirePortfolio } from "./lib/wire";
import {
  type Wire,
  writeFooter,
  writeHeaders,
  writeSection,
  writeSite,
} from "./lib/write";

/**
 * The editor's read and its one write. Both start with `requireAdmin`, which takes
 * the identity from the request's token — never from an argument — and re-reads the
 * admin flag from the database.
 *
 * `save` takes the whole document because that is what the editor holds: a working
 * copy it diffs against what it loaded. The mutation does the same comparison per
 * section and returns the cache keys whose content actually changed, which is what
 * lets the site revalidate one component instead of the whole page.
 */

/** A stable rendering of a value, so two payloads compare regardless of key order. */
function canonical(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([key, entry]) => [key, sortKeys(entry)]),
    );
  }

  return value;
}

const STORAGE_PREFIX = "storage:";

/** Every `storage:<id>` token anywhere in the payload. */
function tokensIn(value: unknown, found = new Set<string>()): Set<string> {
  if (typeof value === "string") {
    if (value.startsWith(STORAGE_PREFIX)) found.add(value);
  } else if (Array.isArray(value)) {
    for (const entry of value) tokensIn(entry, found);
  } else if (value !== null && typeof value === "object") {
    for (const entry of Object.values(value)) tokensIn(entry, found);
  }

  return found;
}

export const load = query({
  args: {},
  returns: v.object({
    portfolio: wirePortfolio,
    /** Preview URLs for the `storage:<id>` tokens the payload carries. */
    storageUrls: v.record(v.string(), v.string()),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const portfolio = await project.portfolio(ctx, project.renderForEditor);
    const storageUrls: Record<string, string> = {};

    for (const token of tokensIn(portfolio)) {
      const url = await ctx.storage.getUrl(
        token.slice(STORAGE_PREFIX.length) as Id<"_storage">,
      );
      if (url) storageUrls[token] = url;
    }

    return { portfolio, storageUrls };
  },
});

export const save = mutation({
  args: { portfolio: wirePortfolio },
  returns: v.object({
    /** Cache keys whose content differs from what was stored. */
    changed: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const before = await project.portfolio(ctx, project.renderForEditor);
    const next: Wire = args.portfolio;

    const changed = new Set<CacheKey>();
    const differs = (key: CacheKey, a: unknown, b: unknown): boolean => {
      if (canonical(a) === canonical(b)) return false;
      changed.add(key);
      return true;
    };

    // The rail first. Every section's wire object carries its own heading, so the
    // per-section comparisons below already account for heading edits; this one is
    // about the order and about invalidating the rail itself.
    if (
      differs(
        "nav",
        { order: before.sectionOrder, headings: headingsOf(before) },
        { order: next.sectionOrder, headings: headingsOf(next) },
      )
    ) {
      await writeHeaders(ctx, next);
    }

    if (differs("site", before.site, next.site)) await writeSite(ctx, next);

    for (const key of SECTION_KEYS) {
      if (!differs(key, before.sections[key], next.sections[key])) continue;
      await writeSection(ctx, key, next);
    }

    if (differs("footer", before.footer, next.footer)) {
      await writeFooter(ctx, next);
    }

    if (changed.size > 0) {
      // A replaced photograph leaves the old file uploaded and unreachable.
      // Sweeping after the transaction commits keeps the save itself cheap.
      await ctx.scheduler.runAfter(0, internal.files.collectGarbage, {});
    }

    return { changed: [...changed] };
  },
});

function headingsOf(portfolio: Wire) {
  return Object.fromEntries(
    SECTION_KEYS.map((key) => {
      const { title, note, navLabel } = portfolio.sections[key];
      return [key, { title, note, navLabel }];
    }),
  );
}
