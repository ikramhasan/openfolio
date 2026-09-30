import { getAwards, getWritten } from "./content";
import { byOrder } from "./data";
import { Entry, EntryList } from "./entry";
import { readPath, slugOf } from "./writing";

function monthYear(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function Awards({ limit }: { limit?: number } = {}) {
  const [{ items }, written] = await Promise.all([
    getAwards(),
    getWritten("awards"),
  ]);

  const native = new Set(written);
  const listed = byOrder(items).slice(0, limit);

  return (
    <EntryList>
      {listed.map((award) => {
        const slug = slugOf(award);
        const here = native.has(slug);

        return (
          <li key={award.title}>
            <Entry
              logo={award.logo}
              title={award.title}
              org={award.organization}
              when={monthYear(award.date)}
              href={here ? readPath("awards", slug) : award.url}
              internal={here}
            >
              {award.description.trim() ? (
                <span className="pf-body block">
                  {award.description.trim()}
                </span>
              ) : null}
            </Entry>
          </li>
        );
      })}
    </EntryList>
  );
}
