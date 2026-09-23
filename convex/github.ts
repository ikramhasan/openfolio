import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalQuery } from "./_generated/server";
import { requireAdmin } from "./lib/authz";

/**
 * Reading an Open source record off the address of the thing it points at.
 *
 * A pull request URL already carries the repository and the number, and GitHub's
 * API answers the rest for free, so the editor fills a row rather than the author
 * transcribing one. What it answers is then stored: the site is prerendered and
 * `cacheLife("max")`, so a render that read GitHub would be a build that fails on
 * their rate limit and a page that never refreshes anyway.
 *
 * Unauthenticated, that limit is 60 requests an hour per IP and each lookup spends
 * two. `GITHUB_TOKEN` — a classic token with no scopes, or a fine-grained one with
 * public read — raises it to 5,000 and is otherwise unnecessary.
 */

/** The action has no database; the gate is a query it runs as the same identity. */
export const assertAdmin = internalQuery({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return null;
  },
});

/** The fields a fetch fills in. Keys match the record's, so the editor can patch by name. */
const contribution = v.object({
  title: v.string(),
  repo: v.string(),
  number: v.number(),
  avatar: v.string(),
  state: v.string(),
  date: v.string(),
  stars: v.number(),
});

type Ref = {
  owner: string;
  name: string;
  kind: "pulls" | "issues";
  number: number;
};

/**
 * `https://github.com/flutter/flutter/pull/183628` and the `/issues/` form. A
 * trailing `/files` or `#comment` is ignored; anything else is not one of these.
 */
function parseRef(url: string): Ref | null {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (
    parsed.hostname !== "github.com" &&
    parsed.hostname !== "www.github.com"
  ) {
    return null;
  }

  const [owner, name, type, number] = parsed.pathname
    .split("/")
    .filter(Boolean);

  if (!owner || !name || !number || !/^\d+$/.test(number)) return null;

  const kind =
    type === "pull" || type === "pulls"
      ? "pulls"
      : type === "issues"
        ? "issues"
        : null;

  if (!kind) return null;

  return { owner, name, kind, number: Number(number) };
}

type Item = {
  title?: string;
  number?: number;
  state?: string;
  draft?: boolean;
  merged_at?: string | null;
  created_at?: string | null;
};

type Repo = {
  full_name?: string;
  stargazers_count?: number;
  owner?: { avatar_url?: string };
};

async function read<T>(path: string): Promise<T> {
  const token = process.env.GITHUB_TOKEN;

  const response = await fetch(`https://api.github.com/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 404) {
    throw new ConvexError("GitHub has nothing at that address.");
  }

  // 403 and 429 are both the rate limit; 401 is a token that is set but wrong.
  if (response.status === 403 || response.status === 429) {
    throw new ConvexError(
      "GitHub is rate limiting this deployment. Try again shortly, or set GITHUB_TOKEN.",
    );
  }

  if (!response.ok) {
    throw new ConvexError(`GitHub answered ${response.status}.`);
  }

  return (await response.json()) as T;
}

/** Merged beats closed: a merged pull request is also a closed one. */
function stateOf(item: Item): string {
  if (item.merged_at) return "merged";
  if (item.draft) return "draft";
  return item.state === "closed" ? "closed" : "open";
}

export const lookup = action({
  args: { url: v.string() },
  returns: contribution,
  handler: async (ctx, { url }) => {
    await ctx.runQuery(internal.github.assertAdmin, {});

    const ref = parseRef(url);
    if (!ref) {
      throw new ConvexError(
        "Not a GitHub pull request or issue URL — expected github.com/owner/repo/pull/123.",
      );
    }

    const base = `repos/${ref.owner}/${ref.name}`;

    const [item, repo] = await Promise.all([
      read<Item>(`${base}/${ref.kind}/${ref.number}`),
      read<Repo>(base),
    ]);

    return {
      title: item.title ?? "",
      repo: repo.full_name ?? `${ref.owner}/${ref.name}`,
      number: item.number ?? ref.number,
      avatar: repo.owner?.avatar_url ?? "",
      state: stateOf(item),
      // The editor's date input takes a day, not an instant.
      date: (item.merged_at ?? item.created_at ?? "").slice(0, 10),
      stars: repo.stargazers_count ?? 0,
    };
  },
});
