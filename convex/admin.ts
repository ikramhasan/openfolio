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
