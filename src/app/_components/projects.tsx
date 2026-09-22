import { formatTags, sortedProjects } from "./data";
import { Mark } from "./mark";
import { TableHead, TableLinkRow, TableList } from "./table";

/**
 * Every project gets an identical row — mark and name, description, tags.
 *
 * The left column holds an ordinal rather than a year: the source data has no
 * project dates, and numbering the list is more honest than inventing one.
 */
export function Projects() {
  return (
    <div>
      <TableHead left="No." middle="Project" right="Link" />

      <TableList>
        {sortedProjects.map((project, index) => (
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
