import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalQuery } from "./_generated/server";
import { requireAdmin } from "./lib/authz";

export const assertAdmin = internalQuery({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return null;
  },
});

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

type Pull = Item & { base?: { repo?: Repo } };

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

  if (response.status === 401) {
    throw new ConvexError(
      "GitHub rejected GITHUB_TOKEN. It may be expired or revoked; set a fresh one on the Convex deployment.",
    );
  }

  const limited =
    response.status === 429 ||
    (response.status === 403 &&
      (response.headers.get("x-ratelimit-remaining") === "0" ||
        response.headers.has("retry-after")));

  if (limited) {
    const reset = Number(response.headers.get("x-ratelimit-reset"));
    const retry = Number(response.headers.get("retry-after"));
    const wait = retry
      ? Math.ceil(retry / 60)
      : reset
        ? Math.max(1, Math.ceil((reset * 1000 - Date.now()) / 60000))
        : null;
    const when = wait ? `in about ${wait} min` : "shortly";

    throw new ConvexError(
      token
        ? `GitHub is rate limiting GITHUB_TOKEN. Try again ${when}.`
        : `GitHub is rate limiting this deployment's shared IP. Try again ${when}, or set GITHUB_TOKEN on the Convex deployment.`,
    );
  }

  if (response.status === 403) {
    throw new ConvexError(
      token
        ? "GitHub refused access. GITHUB_TOKEN may lack access to that repository."
        : "GitHub refused access to that repository.",
    );
  }

  if (!response.ok) {
    throw new ConvexError(`GitHub answered ${response.status}.`);
  }

  return (await response.json()) as T;
}

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

    const item = await read<Pull>(`${base}/${ref.kind}/${ref.number}`);
    const repo = item.base?.repo ?? (await read<Repo>(base));

    return {
      title: item.title ?? "",
      repo: repo.full_name ?? `${ref.owner}/${ref.name}`,
      number: item.number ?? ref.number,
      avatar: repo.owner?.avatar_url ?? "",
      state: stateOf(item),
      date: (item.merged_at ?? item.created_at ?? "").slice(0, 10),
      stars: repo.stargazers_count ?? 0,
    };
  },
});
