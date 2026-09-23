import { getTools } from "./content";
import { byOrder, groupByCategory, hostOf } from "./data";
import { Mark } from "./mark";
import type { Tool } from "./types";

/**
 * Tools as rows, under the category each one is filed in.
 *
 * One line per tool rather than the three-column row the dated sections use: a tool
 * is a name, a mark and where it lives, and there is no date to align down a column.
 * The category takes the place of the column header, on the same hairline and in the
 * same ink, so a section of several groups still reads as one ledger.
 *
 * Group order follows the records, so dragging a row in the editor orders the
 * categories too.
 */
export async function Tools() {
  const { items } = await getTools();
  const groups = groupByCategory(byOrder(items));

  return (
    <div className="space-y-9">
      {groups.map((group) => (
        <section key={group.name}>
          <div className="pf-rule flex items-baseline justify-between gap-x-4 border-b pb-2">
            <h3 className="pf-column">{group.name}</h3>
            <span className="pf-column pf-figure">{group.items.length}</span>
          </div>

          <ul className="pf-rule divide-y">
            {group.items.map((tool) => (
              <li key={tool.title}>
                <Row tool={tool} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** A tool with somewhere to go is a linked row; one without is a row that stays put. */
function Row({ tool }: { tool: Tool }) {
  const body = (
    <>
      {/* The mark sits on the text's baseline rather than its box, as in the other
          sections' rows. */}
      <span className="shrink-0 translate-y-0.5">
        <Mark src={tool.icon} />
      </span>

      <span className="pf-title min-w-0 flex-1 truncate">{tool.title}</span>

      {tool.url ? (
        // Structural rather than content: below `sm` the name is what matters, as
        // with the column headers elsewhere.
        <span className="pf-meta pf-faint hidden min-w-0 shrink truncate sm:block">
          {hostOf(tool.url)}
        </span>
      ) : null}
    </>
  );

  const shape = "pf-row -mx-3 flex items-baseline gap-x-3 px-3 py-3";

  return tool.url ? (
    <a href={tool.url} target="_blank" rel="noreferrer" className={shape}>
      {body}
      <span aria-hidden="true" className="pf-row-arrow pf-meta shrink-0">
        ↗
      </span>
    </a>
  ) : (
    <div className={shape}>{body}</div>
  );
}
