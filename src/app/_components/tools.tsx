import Image from "next/image";
import { getTools } from "./content";
import { byOrder, faviconUrl, groupByCategory, hostOf } from "./data";
import type { Tool } from "./types";

export async function Tools() {
  const { items } = await getTools();

  return <ToolShelf items={items} />;
}

export function ToolShelf({ items }: { items: Tool[] }) {
  const groups = groupByCategory(byOrder(items));

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.name}>
          <h2 className="pf-section-title flex items-baseline gap-2">
            {group.name}
            <span className="pf-meta pf-faint pf-figure font-normal">
              {group.items.length}
            </span>
          </h2>

          <ul className="-mx-3 mt-3 grid grid-cols-2 gap-x-2 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
            {group.items.map((tool) => (
              <li key={tool.title} className="min-w-0">
                <ToolTile tool={tool} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ToolTile({ tool }: { tool: Tool }) {
  const host = tool.url ? hostOf(tool.url) : null;
  const icon = tool.icon || (tool.url ? faviconUrl(tool.url) : "");

  const body = (
    <>
      <span className="pf-logo pf-app-icon relative block size-10 shrink-0">
        {icon ? (
          <Image
            src={icon}
            alt=""
            fill
            sizes="40px"
            className="object-contain p-1.5"
          />
        ) : null}
      </span>

      <span className="block min-w-0 pt-0.5">
        <span className="pf-title block">{tool.title}</span>
        {host ? (
          <span className="pf-meta pf-faint block truncate">{host}</span>
        ) : null}
      </span>
    </>
  );

  const shape = "pf-row flex items-start gap-3 p-3";

  return tool.url ? (
    <a href={tool.url} target="_blank" rel="noreferrer" className={shape}>
      {body}
    </a>
  ) : (
    <div className={shape}>{body}</div>
  );
}
