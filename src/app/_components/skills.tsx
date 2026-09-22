import { sortedSkills } from "./data";
import { Mark } from "./mark";
import { TableHead, TableLinkRow, TableList } from "./table";

/**
 * Skills on the same grid as everything else: level in the left column where
 * years usually sit, name beside it. Every skill carries a URL, so every row is
 * a link across its full width.
 *
 * No bars — the number is the information, and a bar would be the loudest thing
 * on the page for the least reason.
 */
export function Skills() {
  return (
    <div>
      <TableHead left="Level" middle="Technology" />

      <TableList>
        {sortedSkills.map((skill) => (
          <TableLinkRow
            key={skill.title}
            left={String(skill.level)}
            href={skill.url}
          >
            <span className="flex items-baseline gap-2.5">
              <span className="translate-y-0.5">
                <Mark src={skill.icon} />
              </span>
              <span className="pf-title">{skill.title}</span>
            </span>
          </TableLinkRow>
        ))}
      </TableList>

      <p className="pf-meta mt-3">Self-assessed proficiency, out of 100.</p>
    </div>
  );
}
