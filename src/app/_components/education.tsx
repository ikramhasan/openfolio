import { getEducation } from "./content";
import { monthRange } from "./data";
import { Entry, EntryList } from "./entry";

function years(dateRange: string): string {
  const range = monthRange(dateRange);
  if (!range) return dateRange.trim();

  const start = Math.floor(range.start / 12);
  if (range.end === null) return `${start} – Now`;

  const end = Math.floor(range.end / 12);
  return start === end ? String(start) : `${start} – ${end}`;
}

export async function Education({ limit }: { limit?: number } = {}) {
  const { items } = await getEducation();

  return (
    <EntryList>
      {items.slice(0, limit).map((item) => (
        <li key={item.institution}>
          <Entry
            logo={item.logo}
            title={item.title}
            org={item.institution}
            place={item.location.trim()}
            when={years(item.dateRange)}
            href={item.url}
          >
            {item.description ? (
              <span className="pf-body block">{item.description}</span>
            ) : null}
          </Entry>
        </li>
      ))}
    </EntryList>
  );
}
