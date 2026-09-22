import { getProjects } from "./content";
import { byOrder, formatTags } from "./data";
import { Mark } from "./mark";
import { TableHead, TableLinkRow, TableList } from "./table";

/** Projects as rows. The left column is an ordinal: the records have no dates. */
export async function Projects() {
  const { items } = await getProjects();

  return (
    <div>
      <TableHead left="No." middle="Project" right="Link" />

      <TableList>
        {byOrder(items).map((project, index) => (
          <TableLinkRow
            key={project.title}
            left={String(index + 1).padStart(2, "0")}
            href={project.link}
          >
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
          </TableLinkRow>
        ))}
      </TableList>
    </div>
  );
}
