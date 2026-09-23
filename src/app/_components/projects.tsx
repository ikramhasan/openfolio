import { getProjects, getWritten } from "./content";
import { byOrder, formatTags } from "./data";
import { Mark } from "./mark";
import { TableHead, TableLinkRow, TableList, TableRow } from "./table";
import { readPath, slugOf } from "./writing";

/**
 * Projects as rows. The left column is an ordinal: the records have no dates.
 *
 * A project written here goes to its own page; the rest go out to whatever the
 * record links to, and one with neither is a row that does not move.
 */
export async function Projects() {
  const [{ items }, written] = await Promise.all([
    getProjects(),
    getWritten("projects"),
  ]);

  const native = new Set(written);

  return (
    <div>
      <TableHead left="No." middle="Project" right="Link" />

      <TableList>
        {byOrder(items).map((project, index) => {
          const slug = slugOf(project);
          const here = native.has(slug);
          const href = here ? readPath("projects", slug) : project.link;
          const ordinal = String(index + 1).padStart(2, "0");

          const body = (
            <>
              <span className="flex items-baseline gap-2.5">
                <span className="translate-y-0.5">
                  <Mark src={project.logo} />
                </span>
                <span className="pf-title">{project.title}</span>
              </span>

              <span className="pf-body mt-1 block max-w-[72ch]">
                {project.description.trim()}
              </span>

              <span className="pf-meta mt-1.5 block">
                {formatTags(project.tags)}
              </span>
            </>
          );

          return href ? (
            <TableLinkRow
              key={project.title}
              left={ordinal}
              href={href}
              internal={here}
            >
              {body}
            </TableLinkRow>
          ) : (
            <TableRow key={project.title} left={ordinal}>
              {body}
            </TableRow>
          );
        })}
      </TableList>
    </div>
  );
}
