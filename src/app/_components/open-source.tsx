import Image from "next/image";
import { getOpenSource } from "./content";
import { formatCount, repoParts, sortedContributions } from "./data";
import type { OpenSourceSection } from "./types";

type Contribution = OpenSourceSection["items"][number];

const STATES: Record<string, string> = {
  merged: "Merged",
  open: "Open",
  closed: "Closed",
  draft: "Draft",
};

function fullDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function repoUrl(item: Contribution): string | null {
  const repo = item.repo.trim();
  if (!repo.includes("/")) return null;

  try {
    const { origin } = new URL(item.url);
    return `${origin}/${repo}`;
  } catch {
    return null;
  }
}

function Status({ state }: { state: string }) {
  const key = state.trim().toLowerCase();
  if (!key) return null;

  return (
    <span
      className="pf-status-chip inline-flex items-center gap-1.5"
      data-state={key}
    >
      <span aria-hidden="true" className="pf-status-dot" />
      {STATES[key] ?? state}
    </span>
  );
}

function Repository({ items }: { items: Contribution[] }) {
  const [first] = items;
  const { owner, name } = repoParts(first.repo);
  const url = repoUrl(first);
  const stars = Math.max(...items.map((item) => item.stars));

  const label = (
    <>
      {owner ? <span className="pf-muted">{owner} / </span> : null}
      {name}
    </>
  );

  return (
    <section className="pf-rule grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 border-t pt-6 pb-2">
      <span className="pf-logo relative mt-px block size-7 rounded-full">
        {first.avatar ? (
          <Image
            src={first.avatar}
            alt=""
            fill
            sizes="28px"
            className="object-cover"
          />
        ) : null}
      </span>

      <div className="min-w-0">
        <h2 className="pf-title flex flex-wrap items-baseline justify-between gap-x-4">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="pf-repo-link"
            >
              {label}
            </a>
          ) : (
            <span>{label}</span>
          )}
          {stars > 0 ? (
            <span className="pf-meta pf-faint pf-figure font-normal">
              {formatCount(stars)} stars
            </span>
          ) : null}
        </h2>

        <ol className="mt-1">
          {items.map((item) => (
            <li key={item.url || item.title}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="pf-row -mx-3 flex items-baseline justify-between gap-x-6 px-3 py-3"
              >
                <span className="block min-w-0">
                  <span className="pf-body pf-strong block">{item.title}</span>
                  <span className="pf-meta pf-figure mt-1 flex flex-wrap items-center gap-x-3">
                    <Status state={item.state} />
                    <span className="pf-faint">{fullDate(item.date)}</span>
                  </span>
                </span>

                {item.number > 0 ? (
                  <span className="pf-meta pf-figure pf-faint shrink-0">
                    #{item.number}
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export async function OpenSource({ limit }: { limit?: number } = {}) {
  const { items } = await getOpenSource();

  const groups = new Map<string, Contribution[]>();
  const listed = sortedContributions(items)
    .filter((item) => item.title !== "")
    .slice(0, limit);

  for (const item of listed) {
    const key = item.repo.trim().toLowerCase() || item.url;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return (
    <div>
      {[...groups.values()].map((group) => (
        <Repository key={group[0].repo || group[0].url} items={group} />
      ))}
    </div>
  );
}
